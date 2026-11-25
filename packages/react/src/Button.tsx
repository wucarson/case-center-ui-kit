import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { IconName } from '@case-center/core/icons';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** primary＝畫面最重要的一個動作；outline＝一般；destructive＝不可復原；ghost＝工具列、表格內 */
  variant?: 'primary' | 'outline' | 'destructive' | 'ghost';
  /** lg＝48（表單送出、頁首）；sm＝32（工具列、卡片內）。預設：primary 為 lg，其餘為 sm */
  size?: 'lg' | 'sm';
  icon?: IconName;
  /** 送出中：轉圈＋停用 */
  loading?: boolean;
  /** 完成：轉成成功色 */
  done?: boolean;
  style?: string | React.CSSProperties;
  children?: ReactNode;
}

/**
 * 按鈕。只有圖示時一定要給 aria-label。
 *   <Button>儲存變更</Button>
 *   <Button variant="outline" size="lg">取消</Button>
 *   <Button variant="destructive" size="lg" icon="trash">刪除</Button>
 */
export function Button({ variant = 'primary', size, icon, loading, done, disabled, className, style, children, type = 'button', ...rest }: ButtonProps) {
  const primary = variant === 'primary';
  const sz = size ?? (primary ? 'lg' : 'sm');
  const iconOnly = !!icon && (children === undefined || children === null || children === '');
  const cls = primary
    ? cx('btn', sz === 'sm' && 'sm', loading && 'is-load', done && 'done', disabled && 'is-off', className)
    : cx('b2', iconOnly && 'ico', sz === 'lg' && 'lg', variant === 'destructive' && 'dng', variant === 'ghost' && 'gh', disabled && 'is-off', className);
  return (
    <button type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} style={styleOf(style)} {...rest}>
      {loading && <i className="spin" aria-hidden="true" />}
      {icon && <Icon name={icon} />}
      {done ? <span className="roll">{children}</span> : children}
    </button>
  );
}
