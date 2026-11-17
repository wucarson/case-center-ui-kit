// 除錯用：量參考頁與元件頁同一案例裡元素的實際位置（node probe.mjs react multi-select s3 ".ms-s,.ms-s > *,.ck i"）
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [fw = 'react', c, id, sels = '*'] = process.argv.slice(2);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const serve = (dir) => new Promise((ok) => { const s = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(new URL(q.url, 'http://x').pathname).replace(/\/$/, '/index.html')); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' }); r.end(d); }); }).listen(0, () => ok(s)); });
const a = await serve(path.join(root, 'tools/out/ref')), b = await serve(path.join(root, fw, 'dist'));
const br = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const measure = async (url) => {
  const p = await br.newPage(); await p.setViewport({ width: 1400, height: 900 }); await p.goto(url, { waitUntil: 'networkidle0' });
  return p.evaluate((c, id, sels) => {
    const box = document.querySelector(`.case[data-c="${c}"][data-id="${id}"]`); const o = box.getBoundingClientRect();
    return [...box.querySelectorAll(sels)].map((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return `${e.tagName.toLowerCase()}.${e.className?.baseVal ?? e.className} x=${(r.x - o.x).toFixed(2)} y=${(r.y - o.y).toFixed(2)} w=${r.width.toFixed(2)} h=${r.height.toFixed(2)} lh=${cs.lineHeight} fs=${cs.fontSize}`; });
  }, c, id, sels);
};
const A = await measure(`http://localhost:${a.address().port}/`), B = await measure(`http://localhost:${b.address().port}/?c=${c}`);
for (let i = 0; i < Math.max(A.length, B.length); i++) console.log((A[i] || '-').padEnd(80), '|', B[i] || '-');
await br.close(); a.close(); b.close();
