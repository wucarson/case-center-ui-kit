# 案管中心元件（Angular）

「共用邏輯＋JSON 契約＋框架外殼」的 Angular 版。目前有：按鈕、提示訊息、空狀態、骨架、狀態徽章、流程步驟、歷程、圖示、開關、操作選單、核取方塊、單選、分段切換、頁籤、詳情頁籤、追蹤星號、分頁、時間選擇、表單欄位、下拉、多選、日期選擇、期間選擇、確認對話框、資訊提示、提示（Toast）、側邊選單、頭像群組、搜尋與標籤建議、按住確認、拖移排序、檔案上傳、篩選標籤、統計卡、分段統計條（共 35 個）。

| 目錄 | 內容 |
|---|---|
| `../core/` | 共用邏輯（純 TypeScript）：class、aria、鍵盤規則，不依賴框架 |
| `../../contracts/` | JSON 契約：每個部件的標籤、class、aria、鍵盤 |
| `src/` | Angular 外殼：只負責渲染與接事件 |
| `../../apps/angular-demo/` | 展示頁，讀 `apps/shared/cases.ts`，給比對工具截圖 |

外殼用屬性選擇器（`<div ccSwitch>`、`<div ccMenu>`），元件本身就是根元素，不會多包一層，標記才會和展示牆相同。

```html
<button ccButton variant="outline" size="lg">取消</button>
<span ccStatusBadge label="進行中" tone="active"></span>
<div ccEmptyState tone="info" heading="還沒有工單" text="建立第一張工單開始派工" action="新增工單" (act)="create()"></div>
<div ccSwitch [(checked)]="remind" label="到期前提醒"></div>
<div ccSwitch [(checked)]="on" aria-label="顯示負責人"></div>
<div ccMenu [items]="actions" label="更多操作：現場設備異常排查"></div>
<div ccDatePicker [(value)]="due" label="結束日期" [min]="today"></div>
<div ccSidebar [groups]="nav" [(value)]="page" [(collapsed)]="mini" [collapsible]="true"></div>
<div ccHoldConfirm label="結案" (confirm)="close()"></div>
<div ccDragSort [(items)]="columns" aria-label="欄位顯示順序"></div>
<div ccStatRow [items]="stats"></div>
<div ccDataTable label="案件列表" [columns]="cols" [rows]="cases" [(sort)]="sort"></div>
```

資料表格：`columns` 設 `sortable` 的欄可點表頭排序（同一欄再點反向），換順序時各列滑到新位置；`cell: 'due'` 的欄自動標逾期（紅）與今天、3 天內（琥珀），列上 `closed: true` 只顯示日期。單獨用的到期日：`<span ccDueCell due="2026-11-14"></span>`。

表單欄位：文字輸入加 `ccFieldControl`，必填、錯誤、唯讀、停用會從外框帶到輸入框；下拉、多選直接放進去，會自己變成輸入框區。

```html
<div ccFormField label="工單名稱" [required]="true" [counter]="count" htmlFor="name">
  <input ccFieldControl id="name" [(ngModel)]="name" maxlength="50">
</div>
<div ccFormField label="所屬專案" [required]="true">
  <div ccCombo [items]="projects" [(value)]="project" label="所屬專案"></div>
</div>
```

浮起的確認對話框會移到 `<body>` 底下；全站提示用 `toast({ title: '已儲存' })`，`<div ccToaster></div>` 放在 App 最外層一次（佇列在 `core/toast.ts`，三個框架共用）。

## 驗證

```sh
npm run build
cd ../tools
node compare.mjs angular switch        # 逐點比對展示牆
node check-contracts.mjs angular       # 契約檢查
```
