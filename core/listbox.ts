/**
 * 清單選值的共用邏輯：下拉 combo、多選 multi-select（contracts/ 各一份）。
 */
import type { IconName } from '../shared/icons';
import { cx } from './dom';

/** 篩選：有輸入字就只留包含它的項目 */
export const filterItems = (items: string[], query: string | null | undefined) => (query ? items.filter((t) => t.includes(query)) : items);

/* ---- 下拉 combo：從固定清單選一個值；打字可篩選。↑↓ 移動、Enter 選取、Esc 關閉。 ---- */
export type ComboKeyResult = { type: 'open' } | { type: 'move'; index: number } | { type: 'pick'; index: number } | { type: 'close' };

/** 輸入框上的按鍵；不處理的鍵回傳 null（外殼不要 preventDefault） */
export function comboKey(open: boolean, cursor: number, count: number, key: string): ComboKeyResult | null {
  if (key === 'ArrowDown' || key === 'ArrowUp') {
    if (!open) return { type: 'open' };
    const d = key === 'ArrowDown' ? 1 : -1;
    return { type: 'move', index: count ? (cursor + d + count) % count : -1 };
  }
  if (key === 'Enter' && open && cursor >= 0 && cursor < count) return { type: 'pick', index: cursor };
  if (key === 'Escape' && open) return { type: 'close' };
  return null;
}

export interface ComboState { open: boolean; inlineMenu?: boolean; invalid?: boolean }
export const comboClass = (s: ComboState) => cx('dd', s.open && 'open', s.open && s.inlineMenu && 'pin', s.invalid && 'bad');
/** 選項 class：sel＝目前值、hl＝滑過或鍵盤停留 */
export const comboOptionClass = (selected: boolean, active: boolean) => cx(selected && 'sel', active && 'hl');
export const comboOptionId = (inputId: string, i: number) => `${inputId}-opt-${i}`;
export const comboListId = (inputId: string) => `${inputId}-list`;
/** 欄位右側圖示：打開時是搜尋 */
export const comboIcon = (open: boolean): IconName => (open ? 'search' : 'chevronDown');
export const COMBO_EMPTY = '沒有符合的選項';

/* ---- 多選 multi-select：從清單勾選多個；沒選＝全部。 ---- */
export interface MultiState { open: boolean; inlineMenu?: boolean }
export const multiClass = (s: MultiState) => cx('ms', s.open && 'open', s.open && s.inlineMenu && 'pin');
/** 按鈕文字：已選名稱，沒選＝「全部部門」 */
export const multiText = (value: string[], noun: string) => (value.length ? value.join('、') : `全部${noun}`);
/** 沒選時文字用提示色 */
export const multiTextClass = (value: string[]) => (value.length ? '' : 'ph');
export const multiTriggerLabel = (noun: string, ariaLabel?: string) => ariaLabel ?? `篩選${noun}`;
export const multiSearchLabel = (noun: string) => `搜尋${noun}`;
/** 底部說明 */
export const multiFooter = (value: string[], noun: string, unit = '個') => (value.length ? `已選 ${value.length} ${unit}` : `未選＝全部${noun}`);
/** 數量徽章：單選不顯示 */
export const multiShowCount = (value: string[], single?: boolean) => !single && value.length > 0;
/** 勾選或取消；單選直接換成這一個 */
export const multiToggle = (value: string[], t: string, single?: boolean) => (single ? [t] : value.includes(t) ? value.filter((x) => x !== t) : [...value, t]);
/** 觸發鈕、搜尋框上的按鍵：Esc 關閉；Enter、Space、↓ 打開 */
export function multiKey(open: boolean, key: string): 'open' | 'close' | null {
  if (key === 'Escape' && open) return 'close';
  if ((key === 'Enter' || key === ' ' || key === 'ArrowDown') && !open) return 'open';
  return null;
}
