// 表單整合測試：開各框架展示頁的 ?forms，照 apps/shared/forms.ts 逐一驗收綁定、改值、寫入、停用、碰過、重設、送出。
// 也檢查契約：有 form 欄位的元件都要在測試規格裡（新元件漏接表單 → 失敗）。
// 用法：cd tools && node form-check.mjs [react|vue|angular] [元件名]（先建置 apps/<框架>-demo）
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const fw = process.argv[2] || 'angular';
const only = process.argv[3];
const { FORM_CASES } = await import(pathToFileURL(path.join(root, 'apps/shared/forms.ts')).href);

// 契約有 form 的元件，測試規格都要有；型別要一致
const contracts = fs.readdirSync(path.join(root, 'contracts')).filter((f) => f.endsWith('.json') && f !== 'contract.schema.json')
  .map((f) => JSON.parse(fs.readFileSync(path.join(root, 'contracts', f), 'utf8'))).filter((c) => c.form);
const problems = [];
for (const c of contracts) {
  // 命名規則：boolean 用 checked，其餘用 value
  if ((c.form.value === 'boolean') !== (c.form.prop === 'checked')) problems.push(`${c.name}：型別 ${c.form.value} 應該用 ${c.form.value === 'boolean' ? 'checked' : 'value'}，契約寫 ${c.form.prop}`);
  const t = FORM_CASES.find((x) => x.name === c.name);
  if (!t) problems.push(`${c.name}：契約有 form，但 apps/shared/forms.ts 沒有測試`);
  else if (t.type !== c.form.value) problems.push(`${c.name}：契約型別 ${c.form.value}，測試寫 ${t.type}`);
}
for (const t of FORM_CASES) if (!contracts.some((c) => c.name === t.name)) problems.push(`${t.name}：有測試，但契約沒有 form 欄位`);

const dist = path.join(root, 'apps', fw + '-demo', 'dist');
const srv = await new Promise((ok) => {
  const s = http.createServer((q, r) => {
    let p = path.join(dist, decodeURIComponent(new URL(q.url, 'http://x').pathname));
    if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(dist, 'index.html');
    r.writeHead(200, { 'content-type': { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' }[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(r);
  }).listen(0, () => ok(s));
});
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4'] });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewport({ width: 1200, height: 900 });
  const open = async () => { await page.goto(`http://localhost:${srv.address().port}/?forms`, { waitUntil: 'networkidle0' }); await page.waitForFunction(() => window.__forms); };
  const api = (fn, ...a) => page.evaluate((fn, a) => window.__forms[fn](...a), fn, a);
  const read = (t) => page.$eval(`.fcase[data-c="${t.name}"]`, (el, expr) => String(new Function('el', 'return ' + expr)(el)), t.read);
  // lenient：停用時彈出層打不開，後面的步驟找不到元素是正常的，略過
  const run = async (t, lenient = false) => {
    for (const s of t.action) {
      const sel = (s.click || s.type || s.on).replace(/\.fcase/g, `.fcase[data-c="${t.name}"]`);
      if (lenient && !(await page.$(sel))) continue;
      if (s.click) { await page.click(sel); }
      else if (s.type) { await page.click(sel, { count: 3 }); await page.keyboard.press('Backspace'); await page.type(sel, s.text); }
      else { await page.focus(sel); await page.keyboard.press(s.key); }
      await wait(60);
    }
    await page.mouse.click(1150, 880); await wait(60);   // 點空白處：收起彈出層、讓焦點離開
  };
  for (const t of FORM_CASES.filter((x) => !only || x.name === only)) {
    await open();
    const r = { name: t.name, fail: [] };
    const check = (ok, msg) => { if (!ok) r.fail.push(msg); };
    try {
      // 1. 綁定
      check(same((await api('value'))[t.field], t.initial), `綁定：表單初始值 ${JSON.stringify((await api('value'))[t.field])}`);
      check((await read(t)) === t.initialText, `綁定：畫面顯示「${await read(t)}」，應為「${t.initialText}」`);
      // 2. 改值
      await run(t);
      const v = (await api('value'))[t.field];
      check(same(v, t.changed), `改值：表單的值 ${JSON.stringify(v)}，應為 ${JSON.stringify(t.changed)}`);
      check((await read(t)) === t.changedText, `改值：畫面顯示「${await read(t)}」，應為「${t.changedText}」`);
      // 5. 碰過（上面的操作已經聚焦再離開）
      check(await api('touched', t.field), '碰過：操作後離開，表單沒有標記 touched');
      // 3. 寫入
      await api('set', t.field, t.initial); await wait(60);
      check((await read(t)) === t.initialText, `寫入：表單設回初始值，畫面仍顯示「${await read(t)}」`);
      // 4. 停用
      await api('disable', t.field); await wait(60);
      await run(t, true);
      check(same((await api('value'))[t.field], t.initial), `停用：停用後還能改值（變成 ${JSON.stringify((await api('value'))[t.field])}）`);
      await api('enable', t.field); await wait(60);
      // 6. 重設
      await run(t);
      await api('reset'); await wait(60);
      check(same((await api('value'))[t.field], t.initial), `重設：reset() 後值為 ${JSON.stringify((await api('value'))[t.field])}`);
      check((await read(t)) === t.initialText, `重設：畫面顯示「${await read(t)}」`);
      // 7. 送出
      await run(t);
      const sent = await api('submit');
      check(same(sent?.[t.field], t.changed), `送出：送出的資料 ${JSON.stringify(sent?.[t.field])}，應為 ${JSON.stringify(t.changed)}`);
    } catch (e) { r.fail.push('執行失敗：' + e.message.split('\n')[0]); }
    if (errors.length) { r.fail.push('頁面錯誤：' + errors.join('；')); errors.length = 0; }
    results.push(r);
  }
} finally { await browser.close(); srv.close(); }

for (const p of problems) console.log('✗ 契約：' + p);
for (const r of results) console.log(r.fail.length ? `✗ ${r.name}\n    ${r.fail.join('\n    ')}` : `✓ ${r.name}`);
const bad = results.filter((r) => r.fail.length).length + problems.length;
console.log(`\n${fw}：表單 ${results.length - results.filter((r) => r.fail.length).length}／${results.length} 通過${problems.length ? `，契約問題 ${problems.length}` : ''}`);
process.exitCode = bad ? 1 : 0;
