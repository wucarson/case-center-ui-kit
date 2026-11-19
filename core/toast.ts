/**
 * 提示 toast（contracts/toast.json）：單則樣式＋全站提示佇列。
 * 佇列不依賴框架：React 用 useSyncExternalStore、Vue 用 shallowRef、Angular 用 signal 訂閱同一份。
 */
import type { IconName } from '../shared/icons';
import { cx } from './dom';

export type ToastTone = 'ok' | 'info' | 'warn';
export interface ToastData {
  id?: string;
  /** 主訊息，寫結果：「已儲存」 */
  title: string;
  /** 補述，例：「等待 陳大文 覆核」 */
  detail?: string;
  tone?: ToastTone;
  /** 給了就顯示動作（例：「復原」），停留時間延長 */
  action?: { label: string; onClick?: () => void };
}
export type ToastItem = ToastData & { id: string };

export const TOAST_ICON: Record<ToastTone, IconName> = { ok: 'ok', info: 'info', warn: 'warn' };
export const toastClass = (tone: ToastTone = 'ok') => cx('toast', tone);
/** 停留時間：有動作 5 秒，沒有 3.2 秒 */
export const toastDuration = (t: ToastData) => (t.action ? 5000 : 3200);
export const isToastActionKey = (key: string) => key === 'Enter';

let items: ToastItem[] = [];
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

/** 顯示提示；同 id 就地更新。回傳 id */
export function toast(t: ToastData) {
  const id = t.id ?? Math.random().toString(36).slice(2);
  items = [...items.filter((x) => x.id !== id), { ...t, id }];
  emit();
  setTimeout(() => dismiss(id), toastDuration(t));
  return id;
}
export function dismiss(id: string) { items = items.filter((x) => x.id !== id); emit(); }
/** 目前的提示（每次變動換新陣列） */
export const getToasts = () => items;
/** 訂閱變動；回傳解除訂閱 */
export function subscribeToasts(f: () => void) { subs.add(f); return () => { subs.delete(f); }; }

/** 全站提示容器：固定在右下角 */
export const TOASTER_STYLE = { position: 'fixed', right: '16px', bottom: '16px', zIndex: '1100', width: 'min(360px, calc(100vw - 32px))', display: 'flex', flexDirection: 'column', gap: '8px' } as const;
