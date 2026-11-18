/**
 * 比對用的測試案例：每個案例對應 fixtures.json 裡同一個元件的同一張樣本（v＝變體、s＝狀態，依序編號）。
 * React、Vue 的展示頁都讀這份資料，用元件把同樣的內容畫出來，再由 tools/compare.mjs 截圖逐點比對。
 *
 * interact：要用真實操作重現的狀態（滑過、按下、鍵盤聚焦）；target 是第幾個可互動的子項（預設 0）。
 * wrap：樣本外層包的元素（照抄樣本的 style）。
 */
/** selector：要操作的元素（沒給就用 target：第幾個可互動的子項） */
export type Interact = { type: 'hover' | 'press' | 'focus'; target?: number; selector?: string };
export interface Case {
  id: string;
  props?: Record<string, unknown>;
  /** 一個案例裡放好幾個元件（例：按鈕的「大小」） */
  group?: Record<string, unknown>[];
  wrap?: string;
  /** 外層元素的標籤（照樣本）：預設 div */
  wrapTag?: 'div' | 'span';
  interact?: Interact;
}

// 側邊選單的示意資料（和展示牆樣本相同）
const SIDE_WORK = { label: '工作', items: [{ key: 'home', label: '首頁', icon: 'home' }, { key: 'cases', label: '案件', icon: 'cases', count: 43 }, { key: 'dispatch', label: '工單', icon: 'dispatch', count: 12 }, { key: 'projects', label: '專案', icon: 'folder' }] };
const SIDE_WORK2 = { ...SIDE_WORK, items: SIDE_WORK.items.slice(0, 2) };
const SIDE_ADMIN = { label: '管理', collapsible: true, items: [{ key: 'perf', label: '成員績效', icon: 'chart' }, { key: 'reports', label: '報表', icon: 'docs' }] };
const SIDE_FULL = { groups: [SIDE_WORK, SIDE_ADMIN], brand: { logo: '案', name: '案管中心' }, user: { name: '王小明', initial: '王' } };

// 頁籤、詳情頁籤的示意資料（和展示牆樣本相同）
const TABS3 = { style: 'width:100%', tabs: [{ key: 'all', label: '全部' }, { key: 'todo', label: '待處理', count: 12 }, { key: 'at', label: '提及', count: 3 }] };
const TABS2 = { style: 'width:100%', tabs: TABS3.tabs.slice(0, 2) };
const DT = {
  overview: { key: 'overview', label: '概覽', icon: 'overview' },
  cases: { key: 'cases', label: '案件', icon: 'cases', count: 256 },
  dispatch: { key: 'dispatch', label: '工單', icon: 'dispatch', count: 575 },
  docs: { key: 'docs', label: '文件', icon: 'docs', count: 2 },
};

export const CASES: Record<string, Case[]> = {
  button: [
    { id: 'v0', props: { children: '儲存變更' } },
    { id: 'v1', props: { variant: 'outline', size: 'lg', children: '取消' } },
    { id: 'v2', props: { variant: 'destructive', size: 'lg', icon: 'trash', children: '刪除' } },
    { id: 'v3', props: { variant: 'ghost', size: 'lg', icon: 'plus', children: '新增欄位' } },
    { id: 'v4', props: { variant: 'outline', size: 'lg', icon: 'trash', 'aria-label': '刪除' } },
    { id: 'v5', group: [{ children: '48' }, { size: 'sm', children: '32' }], wrap: 'display:flex;gap:8px;align-items:center', wrapTag: 'span' },
    { id: 's0', props: { children: '儲存' } },
    { id: 's1', props: { children: '儲存' }, interact: { type: 'hover' } },
    { id: 's2', props: { children: '儲存' }, interact: { type: 'press' } },
    { id: 's3', props: { children: '儲存' }, interact: { type: 'focus' } },
    { id: 's4', props: { loading: true, children: '儲存中' } },
    { id: 's5', props: { done: true, children: '已儲存' } },
    { id: 's6', props: { disabled: true, children: '儲存' } },
  ],
  switch: [
    { id: 'v0', props: { checked: true, label: '到期前提醒', style: 'width:100%' } },
    { id: 'v1', props: { checked: true, size: 'sm', label: '顯示負責人', style: 'width:100%' } },
    { id: 's0', props: { checked: false } },
    { id: 's1', props: { checked: true } },
    { id: 's2', props: { checked: true }, interact: { type: 'focus' } },
    { id: 's3', props: { checked: false, disabled: true } },
    { id: 's4', props: { checked: true, disabled: true } },
  ],
  checkbox: [
    { id: 'v0', props: { checked: true, label: '同步通知負責人' } },
    {
      id: 'v1',
      props: {
        list: true,
        style: 'width:100%',
        items: [
          { label: '全部成員', selectAll: true, indeterminate: true },
          { label: '王小明', checked: true },
          { label: '陳大文', checked: false },
        ],
      },
    },
    { id: 's0', props: { checked: false } },
    { id: 's1', props: { checked: true } },
    { id: 's2', props: { indeterminate: true } },
    { id: 's3', props: { checked: true }, interact: { type: 'focus' } },
    { id: 's4', props: { checked: false, disabled: true } },
  ],
  'radio-group': [
    { id: 'v0', props: { value: 'dept', style: 'width:100%', options: [{ value: 'dept', label: '依部門' }, { value: 'project', label: '依專案' }, { value: 'member', label: '依成員' }] } },
    { id: 'v1', props: { value: 'after', style: 'width:100%', options: [{ value: 'after', label: '完成後開始', description: '前一個完成才開始' }, { value: 'parallel', label: '同時進行', description: '可以一起做' }] } },
    { id: 's0', props: { single: true, options: [{ value: 'project', label: '依專案' }] } },
    { id: 's1', props: { single: true, value: 'dept', options: [{ value: 'dept', label: '依部門' }] } },
    { id: 's2', props: { single: true, options: [{ value: 'project', label: '依專案' }] }, interact: { type: 'hover' } },
    { id: 's3', props: { single: true, options: [{ value: 'project', label: '依專案' }] }, interact: { type: 'focus' } },
    { id: 's4', props: { single: true, options: [{ value: 'member', label: '依成員', disabled: true }] } },
  ],
  segmented: [
    { id: 'v0', props: { value: 0, options: ['日', '週', '月'] }, wrap: 'width:100%' },
    { id: 'v1', props: { value: 0, size: 'sm', options: ['全部 12', '已選 3'] }, wrap: 'width:100%' },
    { id: 's0', props: { value: 1, options: ['日', '週', '月'] }, wrap: 'width:100%' },
    { id: 's1', props: { value: 0, options: ['日', '週', '月'] }, wrap: 'width:100%', interact: { type: 'hover', target: 2 } },
    { id: 's2', props: { value: 0, options: ['日', '週', '月'] }, wrap: 'width:100%', interact: { type: 'press', target: 2 } },
    { id: 's3', props: { value: 0, options: ['日', '週', '月'] }, wrap: 'width:100%', interact: { type: 'focus', target: 0 } },
  ],
  'form-field': [
    { id: 'v0', props: { label: '工單名稱', required: true, empty: true, placeholder: '例如：機房巡檢', help: '顯示在工單列表與通知', maxLength: 50, showCount: true, value: '' } },
    { id: 'v1', props: { label: '備註', optional: true, placeholder: '補充說明', help: '只有內部成員看得到', value: '' } },
    { id: 'v2', props: { label: '專案描述', optional: true, multiline: true, placeholder: '可補充背景與執行限制', maxLength: 500, showCount: true, value: '' } },
    { id: 'v3', props: { label: '預估工時', required: true, value: '12', suffix: '小時' } },
    { id: 'v4', props: { label: '指派對象', required: true, prefix: 'search', placeholder: '搜尋姓名或部門', value: '' } },
    { id: 'v5', props: { label: '所屬專案', readOnly: true, value: '變電站季度保養', help: '由所屬案件帶入' } },
    { id: 's0', props: { label: '工單名稱', required: true, placeholder: '例如：機房巡檢', value: '' } },
    { id: 's1', props: { label: '工單名稱', required: true, placeholder: '例如：機房巡檢', value: '' }, interact: { type: 'hover' } },
    { id: 's2', props: { label: '工單名稱', required: true, placeholder: '例如：機房巡檢', value: '' }, interact: { type: 'focus' } },
    { id: 's3', props: { label: '工單名稱', required: true, value: '機房巡檢', maxLength: 50, showCount: true } },
    { id: 's4', props: { label: '工單名稱', required: true, placeholder: '例如：機房巡檢', value: '', error: '請輸入工單名稱' } },
    { id: 's5', props: { label: '工單名稱', required: true, value: '機房巡檢', disabled: true } },
  ],
  combo: [
    { id: 'v0', props: { field: { label: '所屬專案', required: true }, label: '所屬專案', placeholder: '請選擇所屬專案', items: ['變電站季度保養', '機房巡檢', '設備汰換'] } },
    { id: 'v1', props: { field: { label: '所屬專案', required: true, error: '請選擇所屬專案' }, label: '所屬專案', placeholder: '請選擇所屬專案', invalid: true, items: ['變電站季度保養', '機房巡檢', '設備汰換'] } },
    { id: 'v2', props: { label: '工作類型', selfLabelled: true, value: '機房巡檢', items: ['機房巡檢', '設備汰換'] } },
    { id: 's0', props: { label: '所屬專案', placeholder: '請選擇所屬專案', items: ['變電站季度保養', '機房巡檢', '設備汰換'] } },
    { id: 's1', props: { label: '所屬專案', placeholder: '請選擇所屬專案', items: ['變電站季度保養', '機房巡檢', '設備汰換'] }, interact: { type: 'hover' } },
    { id: 's2', props: { label: '所屬專案', value: '變電站季度保養', items: ['變電站季度保養', '機房巡檢', '設備汰換'], defaultOpen: true, inlineMenu: true } },
    { id: 's3', props: { label: '所屬專案', items: ['變電站季度保養', '機房巡檢', '設備汰換'], defaultOpen: true, defaultQuery: '巡檢', inlineMenu: true } },
    { id: 's4', props: { label: '所屬專案', items: ['變電站季度保養', '機房巡檢', '設備汰換'], defaultOpen: true, defaultQuery: '空調', inlineMenu: true } },
    { id: 's5', props: { label: '所屬專案', placeholder: '請選擇所屬專案', invalid: true, items: ['變電站季度保養', '機房巡檢', '設備汰換'] } },
  ],
  'multi-select': [
    { id: 'v0', props: { noun: '部門', options: ['設計部', '研發部', '客服部'], value: ['設計部', '研發部'] } },
    { id: 'v1', props: { field: { label: '部門' }, noun: '部門', options: ['設計部', '研發部', '客服部'], value: [] } },
    { id: 'v2', props: { noun: '成員', single: true, options: ['王小明', '陳大文'], value: ['王小明'] } },
    { id: 's0', props: { noun: '部門', options: ['設計部', '研發部', '客服部'], value: [] } },
    { id: 's1', props: { noun: '部門', options: ['設計部', '研發部', '客服部'], value: [] }, interact: { type: 'hover' } },
    { id: 's2', props: { noun: '部門', options: ['設計部', '研發部', '客服部'], value: ['設計部', '研發部'] } },
    { id: 's3', props: { noun: '部門', options: ['設計部', '研發部', '客服部'], value: ['設計部', '研發部'], defaultOpen: true, inlineMenu: true } },
    { id: 's4', props: { noun: '部門', options: ['設計部', '研發部', '客服部'], value: [], defaultOpen: true, defaultQuery: '研', inlineMenu: true } },
  ],
  menu: [
    { id: 'v0', props: { inline: true, items: [{ icon: 'copy', label: '複製' }, { icon: 'link', label: '設定相依' }] } },
    { id: 'v1', props: { inline: true, items: [{ icon: 'repeat', label: '建立排程規則', disabledReason: '這張案件沒有對應的專案' }] } },
    { id: 'v2', props: { inline: true, items: [{ icon: 'copy', label: '複製' }, { separator: true }, { icon: 'x', label: '取消案件', danger: true }] } },
    { id: 's0', props: { label: '更多操作', items: [] } },
    { id: 's1', props: { label: '更多操作', items: [], defaultOpen: true } },
    { id: 's2', props: { inline: true, items: [{ icon: 'copy', label: '複製' }] }, interact: { type: 'hover' } },
    { id: 's3', props: { inline: true, items: [{ icon: 'x', label: '取消案件', danger: true }] }, interact: { type: 'hover' } },
    { id: 's4', props: { inline: true, items: [{ icon: 'repeat', label: '建立排程規則', disabled: true }] } },
  ],
  dialog: [
    { id: 'v0', props: { open: true, inline: true, title: '確認結案', body: '案件將標記為「已結案」。' }, interact: { type: 'focus', target: 1 } },
    { id: 'v1', props: { open: true, inline: true, destructive: true, title: '刪除里程碑', body: '「現場勘查」將從這個專案移除。' }, interact: { type: 'focus', target: 0 } },
    { id: 'v2', props: { open: true, inline: true, destructive: true, title: '刪除里程碑', body: '「現場勘查」將從這個專案移除。', note: '關聯案件與工單不會被刪除。' } },
  ],
  toast: [
    { id: 'v0', props: { title: '已儲存' } },
    { id: 'v1', props: { title: '已送出審核', detail: '等待 陳大文 覆核' } },
    { id: 'v2', props: { title: '已移除成員', detail: '王小明', action: { label: '復原' } } },
    { id: 'v3', props: { title: '已儲存', action: { label: '同步到 ERP' } } },
  ],
  'info-popover': [
    { id: 'v0', props: { label: '加權進度', value: '68%', valueNote: '3 / 5 個里程碑', children: '依里程碑權重加總；沒設權重的平均分配。' } },
    { id: 'v1', props: { label: '加權進度', value: '68%', valueNote: '3 / 5 個里程碑', children: '依里程碑權重加總；沒設權重的平均分配。', defaultOpen: true } },
    { id: 's0', props: { label: '加權進度', value: '68%', valueNote: '3 / 5 個里程碑', children: '依里程碑權重加總；沒設權重的平均分配。' } },
    // 滑過、氣泡還沒打開的瞬間：拉長打開延遲才截得穩
    { id: 's1', props: { label: '加權進度', value: '68%', valueNote: '3 / 5 個里程碑', children: '依里程碑權重加總；沒設權重的平均分配。', openDelay: 60000 }, interact: { type: 'hover' } },
    { id: 's2', props: { label: '加權進度', value: '68%', valueNote: '3 / 5 個里程碑', children: '依里程碑權重加總；沒設權重的平均分配。' }, interact: { type: 'focus' } },
    { id: 's3', props: { label: '加權進度', value: '68%', valueNote: '3 / 5 個里程碑', children: '依里程碑權重加總；沒設權重的平均分配。', defaultOpen: true } },
  ],
  'date-picker': [
    { id: 'v0', props: { label: '結束日期', value: '2026-11-20', help: '結束日期・預設為一週後', today: '2026-11-13', min: '2026-11-13' } },
    { id: 'v1', props: { label: '結束日期', value: '2026-11-20', help: '結束日期・預設為一週後', today: '2026-11-13', min: '2026-11-13', defaultOpen: true } },
    { id: 's0', props: { label: '結束日期', value: '2026-11-20', help: '結束日期・預設為一週後', today: '2026-11-13', min: '2026-11-13' } },
    { id: 's1', props: { label: '結束日期', value: '2026-11-20', help: '結束日期・預設為一週後', today: '2026-11-13', min: '2026-11-13' }, interact: { type: 'hover' } },
    { id: 's2', props: { label: '結束日期', value: '2026-11-20', help: '結束日期・預設為一週後', today: '2026-11-13', min: '2026-11-13', defaultOpen: true } },
    { id: 's3', props: { label: '結束日期', value: '2026-11-20', help: '結束日期・預設為一週後', today: '2026-11-13', min: '2026-11-13', defaultOpen: true }, interact: { type: 'hover', selector: '.dp-g span:nth-of-type(26)' } },
    { id: 's4', props: { label: '結束日期', value: '2026-11-20', help: '結束日期・預設為一週後', today: '2026-11-13', min: '2026-11-13', defaultOpen: true }, interact: { type: 'hover', selector: '.dp-pre span:nth-child(4)' } },
  ],
  'time-picker': [
    { id: 'v0', props: { label: '開始時間', value: '09:30' } },
    { id: 's0', props: { label: '開始時間', value: '09:30' } },
    { id: 's1', props: { label: '開始時間', value: '09:30' }, interact: { type: 'hover', selector: '.tp-col u' } },
  ],
  'period-picker': [
    { id: 'v0', props: { value: 'month', today: '2026-11-13', style: 'width:100%' } },
    { id: 's0', props: { value: 'month', today: '2026-11-13', style: 'width:100%' } },
    { id: 's1', props: { value: '30d', today: '2026-11-13', style: 'width:100%' } },
    { id: 's2', props: { value: 'custom', today: '2026-11-13', custom: ['2026-11-03', '2026-11-12'], style: 'width:100%' } },
  ],
  pagination: [
    { id: 'v0', props: { total: 56, page: 1, pageSize: 20, style: 'width:100%' } },
    { id: 'v1', props: { total: 240, page: 6, pageSize: 20, showSize: false } },
    { id: 's0', props: { total: 60, page: 2, pageSize: 20, showSize: false } },
    { id: 's1', props: { total: 60, page: 2, pageSize: 20, showSize: false }, interact: { type: 'hover', selector: 'nav > span:nth-child(4)' } },
    { id: 's2', props: { total: 60, page: 2, pageSize: 20, showSize: false }, interact: { type: 'hover', selector: 'nav > span:last-child' } },
    { id: 's3', props: { total: 60, page: 1, pageSize: 20, showSize: false } },
  ],
  stepper: [
    { id: 'v0', props: { current: 1, style: 'width:100%', steps: [{ label: '待指派', note: '11-04 完成' }, { label: '處理中', note: '李小美・進行中' }, { label: '待審核' }, { label: '已結案' }] } },
    { id: 'v1', props: { current: 3, style: 'width:100%', steps: [{ label: '待指派', note: '11-04 完成' }, { label: '處理中', note: '11-06 完成' }, { label: '待審核', note: '11-11 完成' }, { label: '已結案', note: '王小明・進行中' }] } },
    { id: 's0', props: { current: 1, steps: [{ label: '待指派', note: '11-04 完成' }] } },
    { id: 's1', props: { current: 0, steps: [{ label: '處理中', note: '李小美・進行中' }] } },
    { id: 's2', props: { current: -1, steps: [{ label: '待審核' }] } },
  ],
  sidebar: [
    { id: 'v0', props: { ...SIDE_FULL, value: 'home' } },
    { id: 'v1', props: { ...SIDE_FULL, value: 'home', collapsed: true } },
    { id: 's0', props: { groups: [SIDE_WORK2] } },
    { id: 's1', props: { groups: [SIDE_WORK2] }, interact: { type: 'hover', selector: '.sd-it:nth-of-type(3)' } },
    { id: 's2', props: { groups: [SIDE_WORK2], value: 'home' } },
    { id: 's3', props: { groups: [{ ...SIDE_ADMIN, defaultOpen: false }] } },
  ],
  tabs: [
    { id: 'v0', props: { ...TABS3, value: 'all', tabs: [{ key: 'all', label: '全部' }, { key: 'todo', label: '待處理' }, { key: 'at', label: '提及' }] } },
    { id: 'v1', props: { ...TABS3, value: 'todo' } },
    { id: 's0', props: { ...TABS2, value: 'all' } },
    { id: 's1', props: { ...TABS2, value: 'all' }, interact: { type: 'hover', selector: '.tab:nth-child(2)' } },
    { id: 's2', props: { ...TABS2, value: 'todo' } },
    { id: 's3', props: { ...TABS2, value: 'all' }, interact: { type: 'focus', selector: '.tab:nth-child(2)' } },
  ],
  'detail-tabs': [
    { id: 'v0', props: { value: 'overview', tabs: [DT.overview, DT.cases, DT.dispatch] } },
    { id: 'v1', props: { value: 'overview', tabs: [DT.overview, DT.cases, DT.docs], groupStarts: ['docs'] } },
    { id: 'v2', props: { value: 'cases', tabs: [{ ...DT.overview, count: null }, { ...DT.cases, count: 3, srCount: '3 件未結' }] } },
    { id: 's0', props: { value: 'cases', tabs: [DT.cases] } },
    { id: 's1', props: { value: '', tabs: [DT.cases] }, interact: { type: 'hover', selector: '.dtab' } },
    { id: 's2', props: { value: 'cases', tabs: [DT.cases] }, interact: { type: 'press', selector: '.dtab' } },
    { id: 's3', props: { value: '', tabs: [DT.cases] }, interact: { type: 'focus', selector: '.dtab' } },
  ],
};
