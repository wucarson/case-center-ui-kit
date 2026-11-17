/**
 * 比對用的測試案例：每個案例對應 fixtures.json 裡同一個元件的同一張樣本（v＝變體、s＝狀態，依序編號）。
 * React、Vue 的展示頁都讀這份資料，用元件把同樣的內容畫出來，再由 tools/compare.mjs 截圖逐點比對。
 *
 * interact：要用真實操作重現的狀態（滑過、按下、鍵盤聚焦）；target 是第幾個可互動的子項（預設 0）。
 * wrap：樣本外層包的元素（照抄樣本的 style）。
 */
export type Interact = { type: 'hover' | 'press' | 'focus'; target?: number };
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
};
