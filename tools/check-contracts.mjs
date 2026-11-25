// 契約檢查：各框架展示頁輸出的標記，是否符合 contracts/*.json（標籤、class、aria、class 與 aria 同步、讀屏名稱）。
// 外觀交給 compare.mjs 逐點比對；這裡檢查的是結構與無障礙，兩者互補。
// 用法：cd tools && node check-contracts.mjs [react|vue|angular] [元件名]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const fw = process.argv[2] || 'react';
const only = process.argv[3] || '';
const dir = path.join(root, 'contracts');
const contracts = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.includes('schema'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
  .filter((c) => !only || c.name === only);

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const srv = await new Promise((ok) => {
  const s = http.createServer((req, res) => {
    const p = path.join(root, 'apps', fw + '-demo', 'dist', decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html'));
    fs.readFile(p, (err, data) => { if (err) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' }); res.end(data); });
  }).listen(0, () => ok(s));
});

// 在頁面裡執行：回傳 [{ id, level, msg }]
function check(contract) {
  const out = [];
  for (const box of document.querySelectorAll(`.case[data-c="${contract.name}"]`)) {
    const id = box.dataset.id;
    const tag = (el) => `<${el.tagName.toLowerCase()} class="${el.getAttribute('class') || ''}">`;
    for (const part of contract.parts) {
      for (const el of box.querySelectorAll(part.selector)) {
        const where = `${part.name} ${tag(el)}`;
        if (el.tagName.toLowerCase() !== part.element) out.push({ id, level: 'error', msg: `${where}：標籤應為 <${part.element}>` });
        for (const c of el.classList) if (!(c in part.classes)) out.push({ id, level: 'error', msg: `${where}：class「${c}」不在契約內` });
        for (const [name, rule] of Object.entries(part.attrs || {})) {
          const v = el.getAttribute(name);
          if (v === null) { if (rule.required) out.push({ id, level: 'error', msg: `${where}：缺少 ${name}` }); continue; }
          if (rule.values && !rule.values.includes(v)) out.push({ id, level: 'error', msg: `${where}：${name}="${v}" 應為 ${rule.values.join('／')}` });
        }
        for (const s of part.sync || []) {
          if (el.classList.contains(s.class) !== (el.getAttribute(s.attr) === s.value)) out.push({ id, level: 'error', msg: `${where}：class「${s.class}」與 ${s.attr}="${s.value}" 不同步` });
        }
        if (part.label && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.textContent.trim()) out.push({ id, level: 'warn', msg: `${where}：沒有讀屏名稱（${part.label}）` });
      }
    }
    if (!contract.parts.some((p) => box.querySelector(p.selector))) out.push({ id, level: 'error', msg: '找不到契約內的任何部件' });
  }
  return out;
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
let errors = 0, warns = 0;
try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${srv.address().port}/`, { waitUntil: 'networkidle0' });
  for (const c of contracts) {
    const found = await page.$$eval(`.case[data-c="${c.name}"]`, (els) => els.length);
    const issues = await page.evaluate(check, c);
    errors += issues.filter((i) => i.level === 'error').length;
    warns += issues.filter((i) => i.level === 'warn').length;
    console.log(`${issues.some((i) => i.level === 'error') ? '✗' : '✓'} ${c.name}（${found} 個案例）`);
    for (const i of issues) console.log(`  ${i.level === 'error' ? '錯誤' : '警告'} ${i.id}：${i.msg}`);
  }
} finally {
  await browser.close(); srv.close();
}
console.log(`\n${fw}：錯誤 ${errors}、警告 ${warns}`);
process.exitCode = errors ? 1 : 0;
