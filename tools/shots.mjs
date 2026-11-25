// 用手機、平板尺寸截展示牆（首頁與元件詳細頁）
import path from 'node:path'; import { pathToFileURL } from 'node:url'; import puppeteer from 'puppeteer-core';
const url = pathToFileURL(path.resolve(process.env.PAGE || '../index.html')).href;
const out = process.argv[2];
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
for (const [name, w, h] of [['phone', 390, 844], ['tablet', 820, 1180]]) {
  for (const [pg, hash] of [['wall', ''], ['detail', '#button/specs']]) {
    const p = await b.newPage();
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: name === 'phone', hasTouch: true });
    // 模擬 Artifact／加上 viewport 設定後的樣子
    if (process.env.VP) await p.evaluateOnNewDocument(() => { const m = document.createElement('meta'); m.name = 'viewport'; m.content = 'width=device-width,initial-scale=1'; document.documentElement.prepend(m); });
    await p.goto(url + hash, { waitUntil: 'load' });
    await p.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
    await new Promise((r) => setTimeout(r, 1500));
    const sw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    console.log(name, pg, '頁寬', sw[0], '視窗', sw[1], sw[0] > sw[1] ? '← 有橫向捲動' : '');
    await p.screenshot({ path: `${out}/${name}-${pg}.png` });
    await p.close();
  }
}
await b.close();
