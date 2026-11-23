/**
 * 資料表格（contracts/data-table.json）：可排序的資料列表，到期欄標逾期與即將到期。
 * 排序：點表頭切換升冪／降冪（同一欄再點一次反向，換欄從升冪開始）；換順序時各列從舊位置滑到新位置（FLIP）。
 * 到期：逾期紅、今天與 3 天內琥珀；已結案只顯示日期。
 */
import { cx } from './dom';

export type SortDir = 'asc' | 'desc';
/** 排序狀態：同一張表的表頭共用；key 為 null＝未排序 */
export interface TableSort { key: string | null; dir: SortDir }
export type ThState = SortDir | 'none';

export interface TableColumn {
  key: string;
  label: string;
  /** 可點表頭排序 */
  sortable?: boolean;
  /** 儲存格 class：id（案號，主色等寬）、nm（名稱，手機版隱藏）、due（到期欄） */
  cell?: 'id' | 'nm' | 'due';
}

/** 表頭顯示狀態（data-s） */
export const thState = (sort: TableSort, key: string): ThState => (sort.key === key ? sort.dir : 'none');
/** 給讀屏的 aria-sort */
export const thAriaSort = (sort: TableSort, key: string) => (sort.key !== key ? 'none' : sort.dir === 'asc' ? 'ascending' : 'descending');
/** 點表頭：同一欄反向，換欄從升冪開始 */
export const nextSort = (sort: TableSort, key: string): TableSort => ({ key, dir: sort.key === key && sort.dir === 'asc' ? 'desc' : 'asc' });
/** 依排序狀態排列（不改原陣列）；值可以是字串或數字 */
export function sortRows<T>(rows: readonly T[], sort: TableSort, value: (row: T, key: string) => unknown = (r, k) => (r as Record<string, unknown>)[k]): T[] {
  if (!sort.key) return rows.slice();
  const k = sort.key, d = sort.dir === 'asc' ? 1 : -1;
  return rows.slice().sort((a, b) => {
    const x = value(a, k) as string | number, y = value(b, k) as string | number;
    return (x > y ? 1 : x < y ? -1 : 0) * d;
  });
}
/** 欄寬：每欄一段 grid-template-columns，沒給就用展示牆預設 */
export const TABLE_COLS = '76px minmax(0, 1fr) 84px 132px';
export const rowClass = (header?: boolean) => cx('tr', header && 'hd');
export const thLabel = (label: string, s: ThState) => `${label}，${s === 'asc' ? '升冪' : s === 'desc' ? '降冪' : '未排序'}，按 Enter 切換排序`;

/* ---- 到期欄 due-cell ---- */
export type DueTone = 'd' | 'w';
export interface DueTag { tone: DueTone; label: string }
/** 幾天內算「即將到期」 */
export const DUE_SOON = 3;
const day = (s: string, year: number) => {
  const m = /^(?:(\d{4})-)?(\d{1,2})-(\d{1,2})$/.exec(s.trim());
  if (!m) return NaN;
  return Date.UTC(m[1] ? +m[1] : year, +m[2] - 1, +m[3]) / 86400000;
};
/** 到期日與今天差幾天（負數＝逾期）；日期可寫 YYYY-MM-DD 或 MM-DD（同今天的年份） */
export function dueDays(due: string, today: string): number {
  const y = +(/^(\d{4})-/.exec(today)?.[1] ?? new Date().getFullYear());
  return Math.round(day(due, y) - day(today, y));
}
/** 標籤：逾期 N 天（紅）、今天／N 天內（琥珀）；已結案或還早就沒有標籤 */
export function dueTag(due: string, today: string, closed = false): DueTag | null {
  if (closed) return null;
  const n = dueDays(due, today);
  if (Number.isNaN(n) || n > DUE_SOON) return null;
  if (n < 0) return { tone: 'd', label: `逾期 ${-n} 天` };
  return { tone: 'w', label: n === 0 ? '今天' : `${n} 天內` };
}
/** 顯示的日期：YYYY-MM-DD 只留 MM-DD */
export const dueText = (due: string) => due.trim().replace(/^\d{4}-/, '');
export const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const tagClass = (t: DueTag) => cx('tagx', t.tone);

/* ---- 換順序的滑動（FLIP） ---- */
/** 換順序前：記下每一列的位置（列要有 data-k） */
export function measureRows(root: Element | null | undefined): Map<string, DOMRect> {
  const m = new Map<string, DOMRect>();
  root?.querySelectorAll<HTMLElement>('.tr[data-k]').forEach((e) => m.set(e.dataset.k!, e.getBoundingClientRect()));
  return m;
}
/** 換順序後：各列從舊位置滑到新位置（560ms、交錯 15ms，同展示牆）；減少動態時不動 */
export function flipRows(root: Element | null | undefined, before: Map<string, DOMRect>) {
  if (!root || !before.size || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  const cs = getComputedStyle(document.documentElement);
  const k = parseFloat(cs.getPropertyValue('--dur')) || 1;
  const ease = cs.getPropertyValue('--spring-soft').trim() || 'cubic-bezier(.3,1.3,.6,1)';
  root.querySelectorAll<HTMLElement>('.tr[data-k]').forEach((e, i) => {
    const b = before.get(e.dataset.k!); if (!b || !('animate' in e)) return;
    const a = e.getBoundingClientRect(), dx = b.left - a.left, dy = b.top - a.top;
    if (dx || dy) e.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 560 * k, easing: ease, delay: i * 15, fill: 'backwards' });
  });
}
/** Enter、Space 觸發表頭排序 */
export const isSortKey = (key: string) => key === 'Enter' || key === ' ';
