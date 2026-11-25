/**
 * 拖移排序（contracts/drag-sort.json）：拖握把調整順序，其他列滑開讓位，原位留虛線空位。
 * 開頭的固定列（locked）不能移動、也不能被擠開；握把可聚焦，↑↓ 移動一格。
 * 列的 DOM 順序不變，位置用 transform 排（拖移中才不會因為重排打斷指標）。
 */
import { cx } from './dom';

export interface SortItem {
  key: string;
  label: string;
  /** 固定在最上面（鎖頭），不能拖、不能隱藏 */
  locked?: boolean;
  /** 顯示（右側開關） */
  visible?: boolean;
}

/** 每列高度＋間距 */
export const SORT_STEP = 32;
export const sortHeight = (n: number) => `${n * SORT_STEP - 2}px`;
export const sortY = (index: number, y?: number) => `translateY(${y ?? index * SORT_STEP}px)`;
export const sortRowClass = (it: SortItem, lifted: boolean) => cx('drg-r', it.visible && 'vis', lifted && 'lift');
export const sortHandleClass = () => 'drg-h';
/** 第一個可移動的位置（開頭的固定列之後） */
export const sortMin = (order: SortItem[]) => { let k = 0; while (k < order.length && order[k].locked) k++; return k; };
export function sortMove<T>(order: T[], from: number, to: number): T[] {
  const next = order.slice();
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}
/** 拖移中：手指位置限制在可移動範圍（上下多留 6px 彈性） */
export const sortClampY = (y: number, min: number, n: number) => Math.max(min * SORT_STEP - 6, Math.min((n - 1) * SORT_STEP + 6, y));
/** 拖到 y 時應該落在第幾格 */
export const sortSlot = (y: number, min: number, n: number) => Math.max(min, Math.min(n - 1, Math.round(y / SORT_STEP)));
/** 握把上的 ↑↓：回傳新位置；不能動或不是方向鍵回傳 null */
export function sortKey(from: number, min: number, n: number, key: string): number | null {
  if (key !== 'ArrowUp' && key !== 'ArrowDown') return null;
  const to = from + (key === 'ArrowUp' ? -1 : 1);
  return to < min || to >= n ? from : to;
}
export const sortHandleLabel = (label: string, i: number, n: number) => `拖移排序：${label}，第 ${i + 1} 項，共 ${n} 項`;
export const sortAnnounce = (label: string, i: number, n: number) => `${label} 移到第 ${i + 1} 項，共 ${n} 項`;
export const sortToggle = (order: SortItem[], key: string) => order.map((it) => (it.key === key && !it.locked ? { ...it, visible: !it.visible } : it));

/** 放下時的淡底閃一下（CSS 動畫 .landed） */
export function sortLand(row: Element | null | undefined) {
  if (!row) return;
  row.classList.remove('landed');
  void (row as HTMLElement).offsetWidth;
  row.classList.add('landed');
}
