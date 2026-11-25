// 逐點比對：React／Vue 元件 vs 展示牆的規格樣本（fixtures.json）。
// 參考頁＝樣本 HTML＋同一份 components.css；元件頁＝各框架 build 出來的展示頁。
// 滑過、按下、鍵盤聚焦用真實操作重現（樣本裡是示範用的 .hv／.is-press／.is-focus）。
// 用法：cd tools && node compare.mjs [react|vue] [元件名]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const fw = process.argv[2] || 'react';
const only = process.argv[3] || '';
const outDir = path.join(root, 'tools', 'out', fw);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// 參考頁
const fixtures = JSON.parse(fs.readFileSync(path.join(root, 'apps', 'shared', 'fixtures.json'), 'utf8'));
const refDir = path.join(root, 'tools', 'out', 'ref');
fs.mkdirSync(refDir, { recursive: true });
const refCases = Object.entries(fixtures).flatMap(([name, f]) => [
  ...f.variants.map(([, h], i) => [name, 'v' + i, h]),
  ...f.states.map(([, h], i) => [name, 's' + i, h]),
]);
fs.writeFileSync(path.join(refDir, 'index.html'), `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<link rel="stylesheet" href="components.css"><link rel="stylesheet" href="case.css"></head><body><main class="cases">
${refCases.map(([n, id, h]) => `<div class="case" data-c="${n}" data-id="${id}">${h}</div>`).join('\n')}
</main></body></html>`);
fs.copyFileSync(path.join(root, 'packages', 'styles', 'components.css'), path.join(refDir, 'components.css'));
fs.copyFileSync(path.join(root, 'apps', 'shared', 'case.css'), path.join(refDir, 'case.css'));

// 靜態伺服器（module script 不能用 file:// 開）
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
function serve(dir) {
  return new Promise((ok) => {
    const srv = http.createServer((req, res) => {
      const p = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html'));
      fs.readFile(p, (err, data) => { if (err) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' }); res.end(data); });
    }).listen(0, () => ok(srv));
  });
}
const refSrv = await serve(refDir);
const implSrv = await serve(path.join(root, 'apps', fw + '-demo', 'dist'));

const FREEZE = `*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }
  /* 樣本裡的 <i class="caret"> 是示意游標；實作是瀏覽器原生游標（會閃爍、不能逐點比），兩邊都不畫 */
  .caret { display: none !important; }`;
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 60000, args: ['--hide-scrollbars', '--font-render-hinting=none', '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4'] });   // 宣告有滑鼠：Linux 無頭瀏覽器（CI）預設沒有，@media (hover: hover) 的滑過樣式會不生效
const results = [];
try {
  const open = async (url) => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.addStyleTag({ content: FREEZE });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    return page;
  };
  const ref = await open(`http://localhost:${refSrv.address().port}/`);
  const impl = await open(`http://localhost:${implSrv.address().port}/${only ? '?c=' + only : ''}`);
  const cases = await impl.$$eval('.case', (els) => els.map((e) => ({ c: e.dataset.c, id: e.dataset.id, interact: e.dataset.interact ? JSON.parse(e.dataset.interact) : null })));
  console.log('案例 ' + cases.length);
  let curC = null;
  for (const k of cases) {
    // 每換一個元件就重新載入元件頁：前一個元件的操作（例如按下）不會影響下一個（例如預設展開的清單）
    if (k.c !== curC) { curC = k.c; await impl.goto(`http://localhost:${implSrv.address().port}/?c=${k.c}`, { waitUntil: 'networkidle0' }); await impl.addStyleTag({ content: FREEZE }); await impl.evaluate(() => document.fonts.ready.then(() => true)); }
    if (process.env.DEBUG) console.log('→', k.c, k.id);
    const sel = `.case[data-c="${k.c}"][data-id="${k.id}"]`;
    const refEl = await ref.$(sel); let implEl = await impl.$(sel);
    if (!refEl) { results.push({ ...k, diff: -1, note: '參考頁沒有這個樣本' }); continue; }
    // 用真實操作重現狀態
    // 只顯示目前這個案例：兩頁的座標完全相同，文字不會因為小數位置不同而反鋸齒不同
    const solo = (s) => document.querySelectorAll('.case').forEach((e) => { e.style.display = e.matches(s) ? '' : 'none'; });
    await ref.evaluate(solo, sel); await impl.evaluate(solo, sel);
    // 有差異就重拍（最多再 2 次）：聚焦、按下的動畫偶爾截在中間，重拍一致就不算失敗
    let diff = -2, a, b, tries = 0;
    for (;; tries++) {
    let release = null;
    await impl.bringToFront();
    if (k.interact) {
      const targets = await implEl.$$('button, [role="switch"], [role="checkbox"], [role="radio"], [tabindex="0"], input, [role="combobox"], [role="menuitem"]');
      const t = k.interact.selector ? await implEl.$(k.interact.selector) : targets[k.interact.target || 0];
      if (k.interact.type === 'hover') await t.hover();
      if (k.interact.type === 'focus') { await impl.keyboard.press('Shift'); await t.focus(); }
      if (k.interact.type === 'press') { const b = await t.boundingBox(); await impl.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await impl.mouse.down(); release = () => impl.mouse.up(); }
    }
    await new Promise((r) => setTimeout(r, k.interact ? 100 : 30));   // 操作後等畫面更新（框架的狀態更新）
    // 背景分頁不重繪：截圖前切到前景（先截元件頁，操作中的狀態才不會跑掉）
    await impl.bringToFront();
    b = PNG.sync.read(Buffer.from(await implEl.screenshot()));
    await ref.bringToFront();
    a = PNG.sync.read(Buffer.from(await refEl.screenshot()));
    if (release) await release();
    if (k.interact) { await impl.mouse.move(1390, 890); await impl.evaluate(() => document.activeElement?.blur()); }
    diff = -2;
    if (a.width === b.width && a.height === b.height) {
      const d = new PNG({ width: a.width, height: a.height });
      diff = pixelmatch(a.data, b.data, d.data, a.width, a.height, { threshold: 0, includeAA: true });
      if (diff) { fs.writeFileSync(path.join(outDir, `${k.c}-${k.id}-diff.png`), PNG.sync.write(d)); }
    }
    if (diff) { fs.writeFileSync(path.join(outDir, `${k.c}-${k.id}-ref.png`), PNG.sync.write(a)); fs.writeFileSync(path.join(outDir, `${k.c}-${k.id}-impl.png`), PNG.sync.write(b)); }
    if (!diff || tries >= 2) break;
    if (process.env.DEBUG) console.log('  重拍', k.c, k.id, '差', diff);
    }
    if (tries && !diff) console.log(`（${k.c} ${k.id} 重拍 ${tries} 次後一致）`);
    results.push({ ...k, diff, size: diff === -2 ? `${a.width}×${a.height} vs ${b.width}×${b.height}` : '' });
  }
} finally {
  await browser.close(); refSrv.close(); implSrv.close();
}
const bad = results.filter((r) => r.diff !== 0);
for (const r of results) console.log(`${r.diff === 0 ? '✓' : '✗'} ${r.c} ${r.id}${r.interact ? '（' + r.interact.type + '）' : ''}${r.diff > 0 ? ` 差 ${r.diff} 點` : r.diff === -2 ? ` 尺寸不同 ${r.size}` : r.diff === -1 ? ' ' + r.note : ''}`);
console.log(`\n${fw}：${results.length - bad.length}／${results.length} 完全一致`);
process.exitCode = bad.length ? 1 : 0;
