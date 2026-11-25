/**
 * 選擇類元件的共用邏輯：核取方塊、單選、分段切換、追蹤星號（contracts/ 各一份）。
 */
import { cx } from './dom';

/** 把焦點移到 root 裡第 index 個符合 selector 的元素 */
export function focusNth(root: Element, selector: string, index: number) {
  root.querySelectorAll<HTMLElement>(selector)[index]?.focus();
}

/* ---- 核取方塊 checkbox：要按儲存才生效的多選。Space 切換。 ---- */
export interface CheckboxState {
  checked?: boolean;
  /** 部分選取（全選的半選狀態） */
  indeterminate?: boolean;
  /** 全選列：粗體、下方分隔線 */
  selectAll?: boolean;
  disabled?: boolean;
}
export const isCheckboxToggleKey = (key: string) => key === ' ';
/** 新值；半選時按下變全選；停用回傳 null */
export const checkboxNext = (s: CheckboxState): boolean | null => (s.disabled ? null : s.indeterminate ? true : !s.checked);
export const checkboxClass = (s: CheckboxState) => cx('ck', s.selectAll && 'all', s.indeterminate ? 'some' : s.checked && 'on', s.disabled && 'dis');
export interface CheckboxAttrs { 'aria-checked': 'true' | 'false' | 'mixed'; 'aria-disabled': 'true' | null; tabindex: '0' | '-1' }
export const checkboxAttrs = (s: CheckboxState): CheckboxAttrs => ({
  'aria-checked': s.indeterminate ? 'mixed' : s.checked ? 'true' : 'false',
  'aria-disabled': s.disabled ? 'true' : null,
  tabindex: s.disabled ? '-1' : '0',
});

/* ---- 單選 radio-group：2–5 個互斥選項。方向鍵切換（跳過停用項）。 ---- */
export interface RadioOption { value: string; label: string; description?: string; disabled?: boolean }
export type RadioKeyResult = { type: 'pick' } | { type: 'move'; dir: 1 | -1 } | null;
export function radioKey(key: string): RadioKeyResult {
  if (key === ' ' || key === 'Enter') return { type: 'pick' };
  if (key === 'ArrowDown' || key === 'ArrowRight') return { type: 'move', dir: 1 };
  if (key === 'ArrowUp' || key === 'ArrowLeft') return { type: 'move', dir: -1 };
  return null;
}
/** 從 from 往 dir 方向找下一個可選的索引；全部停用回傳 -1 */
export function radioMove(options: RadioOption[], from: number, dir: 1 | -1): number {
  const n = options.length;
  for (let k = 1; k <= n; k++) {
    const i = (from + dir * k + n) % n;
    if (!options[i].disabled) return i;
  }
  return -1;
}
/** 只有選中項（沒選時第一項）可以 Tab 進來 */
export function radioTabIndex(options: RadioOption[], value: string | undefined, i: number): 0 | -1 {
  if (options[i].disabled) return -1;
  const cur = options.findIndex((o) => o.value === value);
  return (cur < 0 ? i === 0 : i === cur) ? 0 : -1;
}
export const radioClass = (o: RadioOption, on: boolean) => cx('rad', on && 'on', !!o.description && 'tall', o.disabled && 'dis');

/* ---- 分段切換 segmented：左右鍵切換、選中片滑動。 ---- */
export type SegKeyResult = { index: number; focus: boolean } | null;
export function segmentedKey(key: string, i: number, n: number): SegKeyResult {
  if (key === 'ArrowRight') return { index: (i + 1) % n, focus: true };
  if (key === 'ArrowLeft') return { index: (i - 1 + n) % n, focus: true };
  if (key === ' ' || key === 'Enter') return { index: i, focus: false };
  return null;
}
export const segmentedClass = (size: 'md' | 'sm' = 'md') => cx('seg', size === 'sm' && 'sm');
export const segmentedColumns = (n: number) => `repeat(${n},1fr)`;
/** 選中片的寬度與位置 */
export const segmentedThumb = (n: number, value: number) => ({ width: `calc((100% - 6px) / ${n})`, transform: `translateX(${value * 100}%)` });

/* ---- 追蹤星號 star-toggle：Enter／Space 切換；開啟時播星光（shared/burst.ts）。 ---- */
export const isStarToggleKey = (key: string) => key === 'Enter' || key === ' ';
export const starClass = (on: boolean) => cx('starb', on && 'on');
export const STAR_PATH = 'M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z';
