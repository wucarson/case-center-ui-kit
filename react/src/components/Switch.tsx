import type { CSSProperties, KeyboardEvent } from 'react';
import { cx, styleOf, useFocusVisible } from './util';

export interface SwitchProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  /** 標籤：放在左邊；沒有可見標籤時一定要給 aria-label */
  label?: string;
  'aria-label'?: string;
  /** sm＝欄位面板、表格內 */
  size?: 'md' | 'sm';
  disabled?: boolean;
  className?: string;
  style?: string | CSSProperties;
}

/** 開關：立即生效，不用再按儲存。Space／Enter 切換。 */
export function Switch({ checked, onChange, label, size = 'md', disabled, className, style, ...aria }: SwitchProps) {
  const { focusVisible, focusProps } = useFocusVisible();
  const toggle = () => { if (!disabled) onChange?.(!checked); };
  const onKeyDown = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } };
  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      aria-label={aria['aria-label']}
      tabIndex={disabled ? -1 : 0}
      className={cx('tgr', checked && 'on', disabled && 'dis', className)}
      style={styleOf(style)}
      onClick={toggle}
      onKeyDown={onKeyDown}
      {...focusProps}
    >
      {label && <span>{label}</span>}
      <span className={cx('tg', size === 'sm' && 'sm', focusVisible && 'is-focus')}><i /></span>
    </div>
  );
}
