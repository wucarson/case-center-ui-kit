import type { CSSProperties, KeyboardEvent } from 'react';
import { checkboxAttrs, checkboxClass, checkboxNext, isCheckboxToggleKey } from '@wucarson/facet-core/choice';
import { ICONS } from '@wucarson/facet-core/icons';
import { cx, styleOf, useFocusVisible } from './util';

export interface CheckboxProps {
  checked?: boolean;
  /** 部分選取（全選的半選狀態） */
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  'aria-label'?: string;
  /** 全選列：粗體、下方分隔線 */
  selectAll?: boolean;
  disabled?: boolean;
  className?: string;
  style?: string | CSSProperties;
}

/** 核取方塊：要按儲存才生效的多選。Space 切換。規則在 core/choice.ts。 */
export function Checkbox({ checked = false, indeterminate, onChange, label, selectAll, disabled, className, style, ...aria }: CheckboxProps) {
  const { focusVisible, focusProps } = useFocusVisible();
  const s = { checked, indeterminate, selectAll, disabled };
  const a = checkboxAttrs(s);
  const toggle = () => { const next = checkboxNext(s); if (next !== null) onChange?.(next); };
  const onKeyDown = (e: KeyboardEvent) => { if (isCheckboxToggleKey(e.key)) { e.preventDefault(); toggle(); } };
  return (
    <div
      role="checkbox"
      aria-checked={a['aria-checked']}
      aria-disabled={a['aria-disabled'] ?? undefined}
      aria-label={aria['aria-label']}
      tabIndex={Number(a.tabindex)}
      className={cx(checkboxClass(s), className)}
      style={styleOf(style)}
      onClick={toggle}
      onKeyDown={onKeyDown}
      {...focusProps}
    >
      <i className={focusVisible ? 'is-focus' : undefined}>
        <svg className="ic chk" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS.check }} />
        <svg className="ic dash" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS.dash }} />
      </i>
      {label && <span>{label}</span>}
    </div>
  );
}

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
