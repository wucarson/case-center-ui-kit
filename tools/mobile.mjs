// 手機／平板檢查：每個元件的詳細頁截「互動示範」區，拼成一張總覽，並找出超出畫面的元件
// 用法：node mobile.mjs [phone|tablet] 輸出資料夾
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import { PNG } from 'pngjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [kind = 'phone', out = path.join(root, 'tools', 'out', 'mobile')] = process.argv.slice(2);
const [W, H] = kind === 'phone' ? [390, 844] : [820, 1180];
fs.mkdirSync(out, { recursive: true });
const url = pathToFileURL(path.join(root, 'index.html')).href;
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, protocolTimeout: 60000 });
const p = await b.newPage();
await p.setViewport({ width: W, height: H, deviceScaleFactor: 1, isMobile: kind === 'phone', hasTouch: true });
await p.goto(url, { waitUntil: 'load' });
await p.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
const slugs = await p.$$eval('#wall > .cell', (els) => els.map((e) => e.id));
const shots = [], bad = [];
for (const id of slugs) {
  await p.evaluate((id) => { const c = document.getElementById(id); c?.querySelector('.cell-doc')?.click(); }, id);
  await new Promise((r) => setTimeout(r, 700));
  const info = await p.evaluate(() => {
    const st = document.querySelector('#detail .dt-stage'), cell = st?.querySelector('.cell');
    if (!st || !cell) return null;
    const s = st.getBoundingClientRect(), c = cell.getBoundingClientRect();
    return { title: document.querySelector('#dt-title')?.textContent, over: c.left < s.left - 1 || c.right > s.right + 1, cw: Math.round(c.width), sw: Math.round(s.width), page: document.documentElement.scrollWidth > innerWidth };
  });
  if (!info) { bad.push(id + '：沒有詳細頁'); continue; }
  if (info.over || info.page) bad.push(`${info.title}：卡片 ${info.cw}px／舞台 ${info.sw}px${info.page ? '（頁面橫向捲動）' : ''}`);
  const el = await p.$('#detail .dt-stage');
  const png = PNG.sync.read(Buffer.from(await el.screenshot()));
  shots.push(png);
  await p.evaluate(() => document.querySelector('#detail .dt-back')?.click());
  await new Promise((r) => setTimeout(r, 300));
}
await b.close();
// 拼成總覽（4 欄、縮小一半）
const S = 0.5, cols = kind === 'phone' ? 5 : 3, cw = Math.round(Math.max(...shots.map((s) => s.width)) * S), rows = Math.ceil(shots.length / cols);
const rh = [...Array(rows)].map((_, r) => Math.round(Math.max(...shots.slice(r * cols, r * cols + cols).map((s) => s.height)) * S));
const o = new PNG({ width: cols * (cw + 8), height: rh.reduce((a, h) => a + h + 8, 0) }); o.data.fill(255);
let y0 = 0;
rh.forEach((h, r) => {
  shots.slice(r * cols, r * cols + cols).forEach((im, j) => {
    const w = Math.round(im.width * S), hh = Math.round(im.height * S), x0 = j * (cw + 8);
    for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) { const si = (Math.floor(y / S) * im.width + Math.floor(x / S)) * 4, di = ((y0 + y) * o.width + x0 + x) * 4; for (let c = 0; c < 4; c++) o.data[di + c] = im.data[si + c]; }
  });
  y0 += h + 8;
});
fs.writeFileSync(path.join(out, `${kind}-overview.png`), PNG.sync.write(o));
console.log(`${kind}：檢查 ${shots.length} 個元件`);
console.log(bad.length ? '有問題：\n' + bad.join('\n') : '沒有超出畫面的元件');
