// 把 out/<fw>/ 裡的差異案例拼成一張圖：每列＝參考｜元件｜差異（放大 2 倍），方便一次檢查
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
const dir = path.resolve('out', process.argv[2] || 'react');
const names = [...new Set(fs.readdirSync(dir).filter((f) => f.endsWith('-ref.png')).map((f) => f.replace('-ref.png', '')))].filter((n) => !process.argv[3] || n.startsWith(process.argv[3]));
const S = 2, rows = names.map((n) => ['ref', 'impl', 'diff'].map((k) => { const p = path.join(dir, `${n}-${k}.png`); return fs.existsSync(p) ? PNG.sync.read(fs.readFileSync(p)) : null; }));
const W = Math.max(...rows.flat().filter(Boolean).map((i) => i.width)) * 3 * S + 8, H = rows.reduce((h, r) => h + Math.max(...r.filter(Boolean).map((i) => i.height)) * S + 4, 0);
const out = new PNG({ width: W, height: H }); out.data.fill(255);
let y0 = 0;
for (const r of rows) {
  const rh = Math.max(...r.filter(Boolean).map((i) => i.height));
  r.forEach((im, j) => { if (!im) return; const x0 = j * (im.width * S + 4); for (let y = 0; y < im.height * S; y++) for (let x = 0; x < im.width * S; x++) { const si = (Math.floor(y / S) * im.width + Math.floor(x / S)) * 4, di = ((y0 + y) * W + x0 + x) * 4; for (let c = 0; c < 4; c++) out.data[di + c] = im.data[si + c]; } });
  y0 += rh * S + 4;
}
fs.writeFileSync(path.join(dir, '_montage.png'), PNG.sync.write(out));
console.log(names.join(' '));
