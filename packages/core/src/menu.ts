/**
 * 操作選單（contracts/menu.json）的共用邏輯：⋯ 收起次要動作。
 * ↑↓ 移動（停用項也停得到，才念得到原因）、Home／End 跳頭尾、Enter／Space 選取、Esc 關閉。
 */
import type { IconName } from './icons';
import { cx } from './dom';

export type MenuItem =
  | { separator: true }
  | {
      separator?: false;
      label: string;
      icon?: IconName;
      /** 刪除類：放最後、前面加分隔線，紅字 */
      danger?: boolean;
      /** 停用時寫出原因（不要藏起來） */
      disabledReason?: string;
      disabled?: boolean;
      onSelect?: () => void;
    };

/** 停用（含「有原因的停用」） */
export const isMenuItemOff = (it: MenuItem) => !it.separator && (!!it.disabled || !!it.disabledReason);

/** 鍵盤停得到的項目索引（分隔線以外都算，停用項也算） */
export const menuStops = (items: MenuItem[]) => items.map((it, i) => (it.separator ? -1 : i)).filter((i) => i >= 0);

export type MenuKeyResult =
  | { type: 'move'; index: number }
  | { type: 'select'; index: number }
  | { type: 'close' };

/** 清單上的按鍵：回傳要做的事；不處理的鍵回傳 null（外殼不要 preventDefault） */
export function menuKey(items: MenuItem[], cursor: number, key: string): MenuKeyResult | null {
  const stops = menuStops(items);
  if (!stops.length) return key === 'Escape' ? { type: 'close' } : null;
  const k = stops.indexOf(cursor);
  if (key === 'ArrowDown' || key === 'ArrowUp') return { type: 'move', index: stops[(k + (key === 'ArrowDown' ? 1 : -1) + stops.length) % stops.length] };
  if (key === 'Home') return { type: 'move', index: stops[0] };
  if (key === 'End') return { type: 'move', index: stops[stops.length - 1] };
  if (key === 'Escape') return { type: 'close' };
  if ((key === 'Enter' || key === ' ') && cursor >= 0) return { type: 'select', index: cursor };
  return null;
}

/** 選取：停用項不動作；回傳是否已選取（外殼收到 true 就關閉選單） */
export function menuSelect(it: MenuItem): boolean {
  if (it.separator || isMenuItemOff(it)) return false;
  it.onSelect?.();
  return true;
}

/** 項目 .mn-i 的 class；active＝滑過或鍵盤停留 */
export const menuItemClass = (it: MenuItem, active: boolean) => cx('mn-i', !it.separator && it.danger && 'dng', isMenuItemOff(it) && 'dis', active && 'hl');

/** 觸發鈕的 class */
export const menuTriggerClass = (open: boolean) => cx('b2', 'ico', open && 'on');

/** 把焦點移到清單 panel 裡第 index 個項目（index 是 items 的索引） */
export function focusMenuItem(panel: Element, items: MenuItem[], index: number) {
  panel.querySelectorAll<HTMLElement>('[role="menuitem"]')[menuStops(items).indexOf(index)]?.focus();
}

/** 打開時焦點落在第一個可用項目 */
export function focusFirstMenuItem(root: Element) {
  root.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
}

/** 浮起清單的位置與寬度（觸發鈕右下，靠右對齊） */
export const MENU_FLOAT_STYLE = { width: '210px', opacity: '1', transform: 'none', zIndex: '20' };
