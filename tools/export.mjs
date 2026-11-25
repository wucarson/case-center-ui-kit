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
// 匯出到套件：樣式 → packages/styles、token → packages/tokens、比對樣本 → apps/shared
const at = (...p) => path.join(root, ...p);
export const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars', '--disable-lcd-text', '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4'] });   // 宣告有滑鼠：Linux 無頭瀏覽器（CI）預設沒有，@media (hover: hover) 的滑過樣式會不生效
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof window.__wallExport === 'function');
  // 以淺色模式匯出（深色值由 aiCss 自己切換讀取）
  const data = await page.evaluate(() => { document.documentElement.removeAttribute('data-theme'); return window.__wallExport(); });
  fs.writeFileSync(at('packages', 'styles', 'components.css'), data.css);
  fs.writeFileSync(at('packages', 'tokens', 'src', 'index.ts'), data.tokensTs);
  fs.writeFileSync(at('packages', 'tokens', 'tokens.css'), data.tokensCss);
  fs.writeFileSync(at('apps', 'shared', 'fixtures.json'), JSON.stringify(data.fixtures, null, 2));
  console.log('已匯出 packages/styles/components.css、packages/tokens（index.ts、tokens.css）、apps/shared/fixtures.json（' + Object.keys(data.fixtures).length + ' 個元件的樣本）');
} finally {
  await browser.close();
}
