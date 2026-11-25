import type { CSSProperties, KeyboardEvent } from 'react';
import { isSwitchToggleKey, switchNext, switchRootAttrs, switchRootClass, switchTrackClass, type SwitchState } from '@case-center/core/switch';
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

/** 開關：立即生效，不用再按儲存。Space／Enter 切換。規則在 core/switch.ts。 */
export function Switch({ checked, onChange, label, size = 'md', disabled, className, style, ...aria }: SwitchProps) {
  const { focusVisible, focusProps } = useFocusVisible();
  const s: SwitchState = { checked, disabled, size };
  const a = switchRootAttrs(s);
  const toggle = () => { const next = switchNext(s); if (next !== null) onChange?.(next); };
  const onKeyDown = (e: KeyboardEvent) => { if (isSwitchToggleKey(e.key)) { e.preventDefault(); toggle(); } };
  return (
    <div
      role="switch"
      aria-checked={a['aria-checked']}
      aria-disabled={a['aria-disabled'] ?? undefined}
      aria-label={aria['aria-label']}
      tabIndex={Number(a.tabindex)}
      className={cx(switchRootClass(s), className)}
      style={styleOf(style)}
      onClick={toggle}
      onKeyDown={onKeyDown}
      {...focusProps}
    >
      {label && <span>{label}</span>}
      <span className={switchTrackClass(s, focusVisible)}><i /></span>
    </div>
  );
}
