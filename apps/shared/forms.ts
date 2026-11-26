/**
 * 表單整合測試規格：React、Vue、Angular 的表單頁（?forms）都照這份渲染，tools/form-check.mjs 照這份操作與驗收。
 *
 * 每個框架的表單頁要做到：
 * - 每個元件放在 <div class="fcase" data-c="元件名">，用框架原生的表單綁定接上（Angular：formControlName；Vue：v-model；React：value／defaultValue＋name）
 * - 初始值用 initial；props 照給
 * - window.__forms：value()、set(name, v)、disable(name)、enable(name)、touched(name)、reset()、submit()
 *
 * 驗收（每個元件）：
 * 1. 綁定：畫面顯示初始值（read）
 * 2. 改值：照 action 操作後，表單的值＝changed、畫面＝changedText
 * 3. 寫入：表單 set 回初始值，畫面跟著變
 * 4. 停用：表單停用後照 action 操作，值不變
 * 5. 碰過：聚焦再離開，表單標記 touched（Angular、Vue 有 touched 概念的框架）
 * 6. 重設：改值後 reset()，回到初始值
 * 7. 送出：submit() 的資料包含這個欄位，值正確
 */

/** 操作步驟：click＝滑鼠點；type＝在選擇器上打字（先全選取代）；key＝在選擇器上按鍵 */
export type FormStep = { click: string } | { type: string; text: string } | { key: string; on: string };

export interface FormCase {
  /** 元件名（contracts/*.json 的 name） */
  name: string;
  /** 表單欄位名稱（name 屬性、formControlName） */
  field: string;
  /** 值的型別（和契約的 form.value 相同） */
  type: 'boolean' | 'string' | 'number' | 'string[]';
  initial: unknown;
  changed: unknown;
  props?: Record<string, unknown>;
  action: FormStep[];
  /** 從畫面讀出顯示的值（在 .fcase 元素上執行的運算式，el＝.fcase）；回傳字串 */
  read: string;
  initialText: string;
  changedText: string;
}

/** 測試用的今天（日期、期間的快捷選項才固定） */
export const FORM_TODAY = '2026-11-20';

export const FORM_CASES: FormCase[] = [
  {
    name: 'form-field', field: 'title', type: 'string', initial: '設備巡檢', changed: '冷氣維修',
    props: { label: '工單名稱' },
    action: [{ type: '.fcase input', text: '冷氣維修' }],
    read: `el.querySelector('input').value`, initialText: '設備巡檢', changedText: '冷氣維修',
  },
  {
    name: 'combo', field: 'kind', type: 'string', initial: '巡檢', changed: '維修',
    props: { items: ['巡檢', '維修', '保養'], label: '工作類型', selfLabelled: true },
    action: [{ click: '.fcase input' }, { click: '.fcase [role="option"]:nth-child(2)' }],
    read: `el.querySelector('input').value`, initialText: '巡檢', changedText: '維修',
  },
  {
    name: 'multi-select', field: 'depts', type: 'string[]', initial: [], changed: ['工務'],
    props: { options: ['工務', '資訊', '總務'], noun: '部門' },
    action: [{ click: '.fcase .ms-t' }, { click: '.fcase .ms-l [role="checkbox"]' }],
    read: `el.querySelector('.ms-t > span').textContent.trim()`, initialText: '全部部門', changedText: '工務',
  },
  {
    name: 'date-picker', field: 'due', type: 'string', initial: '2026-11-20', changed: '2026-11-21',
    props: { label: '結束日期', today: FORM_TODAY },
    action: [{ click: '.fcase .dp-f' }, { click: '.fcase .dp-pre span:nth-child(2)' }],
    read: `el.querySelector('.dp-f .roll').textContent.trim()`, initialText: '2026-11-20（五）', changedText: '2026-11-21（六）',
  },
  {
    name: 'period-picker', field: 'period', type: 'string', initial: 'month', changed: '30d',
    props: { today: FORM_TODAY },
    action: [{ click: '.fcase [role="radio"]:nth-of-type(2)' }],
    read: `el.querySelector('[role="radio"][aria-checked="true"]').textContent.trim()`, initialText: '本月', changedText: '近 30 天',
  },
  {
    name: 'time-picker', field: 'start', type: 'string', initial: '09:00', changed: '10:00',
    props: { label: '開始時間' },
    action: [{ click: '.fcase [aria-label="時加一"]' }],
    read: `el.querySelector('.tp-f .roll').textContent.trim()`, initialText: '09:00', changedText: '10:00',
  },
  {
    name: 'checkbox', field: 'notify', type: 'boolean', initial: false, changed: true,
    props: { label: '同步通知負責人' },
    action: [{ click: '.fcase [role="checkbox"]' }],
    read: `el.querySelector('[role="checkbox"]').getAttribute('aria-checked')`, initialText: 'false', changedText: 'true',
  },
  {
    name: 'radio-group', field: 'groupBy', type: 'string', initial: 'status', changed: 'owner',
    props: { options: [{ value: 'status', label: '依狀態' }, { value: 'owner', label: '依負責人' }, { value: 'due', label: '依到期日' }], 'aria-label': '分組方式' },
    action: [{ click: '.fcase [role="radio"]:nth-child(2)' }],
    read: `el.querySelector('[role="radio"][aria-checked="true"]').textContent.trim()`, initialText: '依狀態', changedText: '依負責人',
  },
  {
    name: 'switch', field: 'remind', type: 'boolean', initial: true, changed: false,
    props: { label: '到期前提醒' },
    action: [{ click: '.fcase [role="switch"]' }],
    read: `el.querySelector('[role="switch"]').getAttribute('aria-checked')`, initialText: 'true', changedText: 'false',
  },
  {
    name: 'segmented', field: 'range', type: 'number', initial: 0, changed: 2,
    props: { options: ['日', '週', '月'], 'aria-label': '時間範圍' },
    action: [{ click: '.fcase [role="radio"]:nth-of-type(3)' }],
    read: `el.querySelector('[role="radio"][aria-checked="true"]').textContent.trim()`, initialText: '日', changedText: '月',
  },
  {
    name: 'tag-search', field: 'q', type: 'string', initial: '', changed: '冷氣',
    props: { tags: [{ label: '冷氣', count: 3 }, { label: '電梯', count: 1 }], label: '搜尋公告' },
    action: [{ type: '.fcase input', text: '冷氣' }],
    read: `el.querySelector('input').value`, initialText: '', changedText: '冷氣',
  },
];
