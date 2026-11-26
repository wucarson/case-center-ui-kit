import { forwardRef, type CSSProperties, type KeyboardEvent } from 'react';
import { checkboxAttrs, checkboxClass, checkboxNext, isCheckboxToggleKey } from '@wucarson/facet-core/choice';
import { ICONS } from '@wucarson/facet-core/icons';
import { FormValue, leaveHandler, useControlled, type FieldProps } from './form';
import { cx, styleOf, useFocusVisible } from './util';

export interface CheckboxProps extends FieldProps {
  /** 受控：是否勾選 */
  checked?: boolean;
  /** 非受控：初始值 */
  defaultChecked?: boolean;
  /** 部分選取（全選的半選狀態） */
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  'aria-label'?: string;
  /** 全選列：粗體、下方分隔線 */
  selectAll?: boolean;
  className?: string;
  style?: string | CSSProperties;
}

/**
 * 核取方塊：要按儲存才生效的多選。Space 切換。規則在 core/choice.ts。
 * 表單：受控 checked＋onChange，或非受控 defaultChecked＋name（勾選時送 "on"）
 */
export const Checkbox = forwardRef<HTMLDivElement, CheckboxProps>(function Checkbox({ checked, defaultChecked, indeterminate, onChange, label, selectAll, disabled, name, onBlur, className, style, ...aria }, ref) {
  const { focusVisible, focusProps } = useFocusVisible();
  const [on, set] = useControlled(checked, defaultChecked, onChange, false);
  const leave = leaveHandler(onBlur);
  const s = { checked: on, indeterminate, selectAll, disabled };
  const a = checkboxAttrs(s);
  const toggle = () => { const next = checkboxNext(s); if (next !== null) set(next); };
  const onKeyDown = (e: KeyboardEvent) => { if (isCheckboxToggleKey(e.key)) { e.preventDefault(); toggle(); } };
  return (
    <div
      ref={ref}
      role="checkbox"
      aria-checked={a['aria-checked']}
      aria-disabled={a['aria-disabled'] ?? undefined}
      aria-label={aria['aria-label']}
      tabIndex={Number(a.tabindex)}
      className={cx(checkboxClass(s), className)}
      style={styleOf(style)}
      onClick={toggle}
      onKeyDown={onKeyDown}
      onFocus={focusProps.onFocus}
      onBlur={(e) => { focusProps.onBlur(); leave(e); }}
    >
      <i className={focusVisible ? 'is-focus' : undefined}>
        <svg className="ic chk" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS.check }} />
        <svg className="ic dash" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS.dash }} />
      </i>
      {label && <span>{label}</span>}
      <FormValue name={name} value={on} disabled={disabled} />
    </div>
  );
});

/** 一組核取方塊（垂直排列）。第一項可設 selectAll。 */
export function CheckboxList({ items, onChange, className, style }: {
  items: (Omit<CheckboxProps, 'onChange'> & { key?: string })[];
  onChange?: (index: number, checked: boolean) => void;
  className?: string;
  style?: string | CSSProperties;
}) {
  return (
    <div className={cx('cks', className)} role="group" style={styleOf(style)}>
      {items.map((it, i) => <Checkbox key={it.key ?? i} {...it} onChange={(v) => onChange?.(i, v)} />)}
    </div>
  );
}
