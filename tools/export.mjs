// 從元件展示牆（index.html）匯出元件專案共用的檔案到 shared/：
//   components.css  元件樣式（所有狀態、深色模式、動畫；變數已解析）
//   tokens.ts／tokens.css  設計 token
//   fixtures.json   規格頁每個變體與狀態的 HTML 樣本（像素比對的標準答案）
// 用法：cd tools && npm run export
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'shared');
export const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof window.__wallExport === 'function');
  // 以淺色模式匯出（深色值由 aiCss 自己切換讀取）
  const data = await page.evaluate(() => { document.documentElement.removeAttribute('data-theme'); return window.__wallExport(); });
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'components.css'), data.css);
  fs.writeFileSync(path.join(out, 'tokens.ts'), data.tokensTs);
  fs.writeFileSync(path.join(out, 'tokens.css'), data.tokensCss);
  fs.writeFileSync(path.join(out, 'fixtures.json'), JSON.stringify(data.fixtures, null, 2));
  console.log('已匯出 shared/：components.css、tokens.ts、tokens.css、fixtures.json（' + Object.keys(data.fixtures).length + ' 個元件的樣本）');
} finally {
  await browser.close();
}
