import { forwardRef, type CSSProperties, type KeyboardEvent } from 'react';
import { isSwitchToggleKey, switchNext, switchRootAttrs, switchRootClass, switchTrackClass, type SwitchState } from '@wucarson/facet-core/switch';
import { FormValue, leaveHandler, useControlled, type FieldProps } from './form';
import { cx, styleOf, useFocusVisible } from './util';

export interface SwitchProps extends FieldProps {
  /** 受控：目前開或關 */
  checked?: boolean;
  /** 非受控：初始值 */
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** 標籤：放在左邊；沒有可見標籤時一定要給 aria-label */
  label?: string;
  'aria-label'?: string;
  /** sm＝欄位面板、表格內 */
  size?: 'md' | 'sm';
  className?: string;
  style?: string | CSSProperties;
}

/**
 * 開關：立即生效，不用再按儲存。Space／Enter 切換。規則在 core/switch.ts。
 * 表單：受控 checked＋onChange，或非受控 defaultChecked＋name（開啟時送 "on"）
 */
export const Switch = forwardRef<HTMLDivElement, SwitchProps>(function Switch({ checked, defaultChecked, onChange, label, size = 'md', disabled, name, onBlur, className, style, ...aria }, ref) {
  const { focusVisible, focusProps } = useFocusVisible();
  const [on, set] = useControlled(checked, defaultChecked, onChange, false);
  const s: SwitchState = { checked: on, disabled, size };
  const a = switchRootAttrs(s);
  const leave = leaveHandler(onBlur);
  const toggle = () => { const next = switchNext(s); if (next !== null) set(next); };
  const onKeyDown = (e: KeyboardEvent) => { if (isSwitchToggleKey(e.key)) { e.preventDefault(); toggle(); } };
  return (
    <div
      ref={ref}
      role="switch"
      aria-checked={a['aria-checked']}
      aria-disabled={a['aria-disabled'] ?? undefined}
      aria-label={aria['aria-label']}
      tabIndex={Number(a.tabindex)}
      className={cx(switchRootClass(s), className)}
      style={styleOf(style)}
      onClick={toggle}
      onKeyDown={onKeyDown}
      onFocus={focusProps.onFocus}
      onBlur={(e) => { focusProps.onBlur(); leave(e); }}
    >
      {label && <span>{label}</span>}
      <span className={switchTrackClass(s, focusVisible)}><i /></span>
      <FormValue name={name} value={on} disabled={disabled} />
    </div>
  );
});
