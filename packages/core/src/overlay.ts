/**
 * 浮起類的共用邏輯：確認對話框 dialog、資訊提示 info-popover（contracts/ 各一份）。
 */
import { cx } from './dom';

/* ---- 確認對話框 dialog：Esc＝取消；Tab 只在兩顆按鈕間移動。 ---- */
export type DialogFocus = 'confirm' | 'cancel' | 'none';
/** 一開始聚焦的按鈕：破壞性＝取消，其他＝確認 */
export const dialogFocusKey = (initialFocus: DialogFocus | undefined, destructive?: boolean): DialogFocus => initialFocus ?? (destructive ? 'cancel' : 'confirm');
export function focusDialogButton(card: Element | null | undefined, key: DialogFocus) {
  if (key !== 'none') card?.querySelector<HTMLElement>(key === 'cancel' ? '.cancel' : '.ok')?.focus();
}
/** 對話框上的按鍵：Esc＝取消；Tab 在按鈕間循環（焦點不離開對話框）。回傳 true＝已處理 */
export function dialogKey(card: Element | null | undefined, e: { key: string; shiftKey: boolean }, cancel: () => void): boolean {
  if (e.key === 'Escape') { cancel(); return true; }
  if (e.key === 'Tab') {
    const f = [...(card?.querySelectorAll<HTMLElement>('[role="button"]') ?? [])];
    const i = f.indexOf(document.activeElement as HTMLElement);
    f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length]?.focus();
    return true;
  }
  return false;
}
/** 按鈕的焦點框：取消用 fc、確認用 is-focus（同展示牆） */
export type DialogButton = 'ok' | 'cancel';
export const dialogCancelClass = (focus: DialogButton | null) => cx('cancel', focus === 'cancel' && 'fc');
export const dialogOkClass = (focus: DialogButton | null, destructive?: boolean) => cx('ok', destructive && 'dng', focus === 'ok' && 'is-focus');
export const dialogClass = (inline?: boolean) => cx('dl-d', inline && 'pin');
/** 浮起時鋪滿視窗的外層 */
export const DIALOG_OVERLAY_STYLE = { position: 'fixed', inset: '0', zIndex: '1000', borderRadius: '0' } as const;
let dialogSeq = 0;
/** 標題 id（aria-labelledby 用，一頁多個對話框也不重複） */
export const dialogTitleId = () => `cc-dl-t${++dialogSeq}`;

/* ---- 資訊提示 info-popover：滑過 150ms 打開、點擊釘住、Esc 關閉。 ---- */
export const POPOVER_DELAY = 150;
export const popoverButtonLabel = (label: string) => `${label}：說明`;
/** ⓘ 上的按鍵 */
export const popoverKey = (key: string): 'toggle' | 'close' | null => (key === 'Enter' || key === ' ' ? 'toggle' : key === 'Escape' ? 'close' : null);
/** 氣泡箭頭對準 ⓘ 的中心（--ax，相對氣泡左緣；量法同展示牆） */
export function placePopoverArrow(btn: HTMLElement | null | undefined, pop: HTMLElement | null | undefined) {
  if (btn && pop) pop.style.setProperty('--ax', `${btn.offsetLeft + btn.offsetWidth / 2 - pop.offsetLeft}px`);
}
let popSeq = 0;
export const popoverId = () => `ip-${++popSeq}`;

/**
 * 滑過延遲打開、點擊釘住的狀態機（不依賴框架；外殼把 set 接到自己的狀態）。
 * 釘住時滑出不關；點外面或 Esc 關閉並取消釘住。
 */
export class PopoverControl {
  open: boolean;
  pinned = false;
  private timer = 0;
  constructor(private readonly set: (open: boolean, pinned: boolean) => void, open = false, public delay = POPOVER_DELAY) { this.open = open; }
  private emit(open: boolean, pinned: boolean) { this.open = open; this.pinned = pinned; this.set(open, pinned); }
  enter() { clearTimeout(this.timer); this.timer = window.setTimeout(() => this.emit(true, this.pinned), this.delay); }
  leave() { clearTimeout(this.timer); if (!this.pinned) this.emit(false, false); }
  toggle() { const p = !this.pinned; this.emit(p, p); }
  close() { this.emit(false, false); }
  dispose() { clearTimeout(this.timer); }
}
