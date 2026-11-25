/**
 * 按鈕（contracts/button.json）的 class 規則。只有圖示時一定要給 aria-label。
 * primary 用 .btn；其餘用 .b2。
 */
import { cx } from './dom';

export type ButtonVariant = 'primary' | 'outline' | 'destructive' | 'ghost';

export interface ButtonState {
  /** primary＝畫面最重要的一個動作；outline＝一般；destructive＝不可復原；ghost＝工具列、表格內 */
  variant?: ButtonVariant;
  /** lg＝48（表單送出、頁首）；sm＝32（工具列、卡片內）。預設：primary 為 lg，其餘為 sm */
  size?: 'lg' | 'sm';
  /** 只有圖示、沒有文字 */
  iconOnly?: boolean;
  /** 送出中：轉圈＋停用 */
  loading?: boolean;
  /** 完成：轉成成功色 */
  done?: boolean;
  disabled?: boolean;
}

export function buttonClass({ variant = 'primary', size, iconOnly, loading, done, disabled }: ButtonState) {
  const primary = variant === 'primary';
  const sz = size ?? (primary ? 'lg' : 'sm');
  return primary
    ? cx('btn', sz === 'sm' && 'sm', loading && 'is-load', done && 'done', disabled && 'is-off')
    : cx('b2', iconOnly && 'ico', sz === 'lg' && 'lg', variant === 'destructive' && 'dng', variant === 'ghost' && 'gh', disabled && 'is-off');
}
