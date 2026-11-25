# 案管中心 UI Kit（元件展示牆）

案管中心介面使用的元件、顏色、狀態與動態，整理成單一 HTML 頁面。新元件的樣式一律以這面展示牆為準。

## 使用方式

直接用瀏覽器開啟 `index.html`，不需要安裝或建置。

## 內容

- 40 組元件：按鈕、分段切換、頁籤、詳情頁籤、下拉選單、多選下拉、搜尋、表單欄位、勾選、單選、開關、拖移排序、操作選單、對話框、說明氣泡、空狀態、徽章、提示框、通知、Toast、日期／時間選擇、上傳、分頁、頭像、骨架屏、圖表等
- 繁中、英、日、泰、德五種語言，外文版另有短字與欄寬調整，避免跑版
- 元件詳細頁：點卡片進入，含互動示範（可單獨暫停；按鈕、表單欄位暫停後可直接操作）、使用時機、禁止使用、無障礙、repo 對應；每個元件有自己的網址（例如 `#form-field`），可複製連結分享
- 按鈕、表單欄位另有「規格」頁籤（`#button/specs`）：變體預覽／程式碼、狀態對照、參數表
- 搜尋：⌘K／Ctrl+K 或 `/`，可用中文、英文、程式名稱找元件
- 字型七級：display、headline、title、body、label、caption、numeric
- 淺色／深色主題、多國語言切換
- 自訂面板（基本／進階／顯示）：調整風格、字型、主色、圓角、動畫，並匯出 `case-center.css`

## 元件套件（Facet）

展示牆的元件打包成 6 個 npm 套件，統稱 **Facet**，React、Vue、Angular 專案直接安裝使用。外觀以展示牆為準，用逐像素比對驗證一致。

| 套件 | 內容 |
| --- | --- |
| `@wucarson/facet-styles` | 元件樣式（含預設 token），三個框架都要引入 |
| `@wucarson/facet-tokens` | 設計 token：TS 物件與 CSS 變數（圖表、行內樣式用） |
| `@wucarson/facet-core` | 共用邏輯（class、aria、鍵盤規則、圖示），不依賴框架；框架套件會自動帶入 |
| `@wucarson/facet-react` | React 18 以上 |
| `@wucarson/facet-vue` | Vue 3.3 以上 |
| `@wucarson/facet-angular` | Angular 22（standalone 元件，屬性選擇器 `<button ccButton>`） |

### 安裝

套件發佈在 GitHub Packages。使用的專案根目錄加 `.npmrc`，並準備一組有 `read:packages` 權限的 GitHub token：

```
@wucarson:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```sh
npm i @wucarson/facet-react @wucarson/facet-styles     # Vue、Angular 換成 facet-vue、facet-angular
```

### 使用

```ts
// React
import '@wucarson/facet-styles/components.css';
import { Button, DataTable } from '@wucarson/facet-react';

// Vue
import '@wucarson/facet-styles/components.css';
import { Button, DataTable } from '@wucarson/facet-vue';
```

```css
/* Angular：styles.css */
@import '@wucarson/facet-styles';
```

```ts
// Angular：元件裡
import { Button, DataTable } from '@wucarson/facet-angular';
@Component({ imports: [Button, DataTable], template: `<button ccButton variant="outline">取消</button>` })
```

### 開發

```sh
npm install                # 根目錄，一次裝好全部（npm workspaces）
npm run build:packages     # 建置 6 個套件
npm run build:apps         # 建置三個展示頁（比對工具截圖用）
npm run pack:check         # 安裝測試：打包後裝進全新專案，檢查載入與 React／Vue／Angular 型別
cd tools && node export.mjs          # 展示牆改了之後：匯出樣式、token、比對樣本到套件
cd tools && node compare.mjs react   # 逐像素比對（react｜vue｜angular）
```

## 檔案

| 路徑 | 說明 |
| --- | --- |
| `index.html` | 展示牆本體，CSS 與 JS 都在檔案內 |
| `packages/` | 6 個套件的原始碼 |
| `apps/` | 三個框架的展示頁與共用測試案例（`apps/shared`） |
| `contracts/` | JSON 契約：每個元件的標籤、class、aria、鍵盤 |
| `tools/` | 匯出、像素比對、契約檢查、安裝測試 |

## 備註

- 畫面上的人名、案件、數字都是虛構的示範資料。
- 外部資源只有 Google Fonts 與 cdnjs 上的 JSZip（匯出用）。
