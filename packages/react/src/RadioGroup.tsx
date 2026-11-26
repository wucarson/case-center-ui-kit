import { forwardRef, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { focusNth, radioClass, radioKey, radioMove, radioTabIndex, type RadioOption } from '@wucarson/facet-core/choice';
import { FormValue, leaveHandler, useControlled, useFieldRef, type FieldProps } from './form';
import { cx, styleOf, useFocusVisible } from './util';

export type { RadioOption };

export interface RadioGroupProps extends FieldProps {
  options: RadioOption[];
  /** 受控：選中的值 */
  value?: string;
  /** 非受控：初始值 */
  defaultValue?: string;
  onChange?: (value: string) => void;
  'aria-label'?: string;
  /** 只有一個選項、不包外層清單（展示單一狀態用） */
  single?: boolean;
  className?: string;
  style?: string | CSSProperties;
}

function Radio({ o, on, tabIndex, onPick, onArrow }: { o: RadioOption; on: boolean; tabIndex: number; onPick: () => void; onArrow: (d: 1 | -1) => void }) {
  const { focusVisible, focusProps } = useFocusVisible();
  const onKeyDown = (e: KeyboardEvent) => {
    const r = radioKey(e.key);
    if (!r) return;
    e.preventDefault();
    if (r.type === 'pick') onPick(); else onArrow(r.dir);
  };
  return (
    <div
      role="radio"
      aria-checked={on}
      aria-disabled={o.disabled || undefined}
      tabIndex={tabIndex}
      className={radioClass(o, on)}
      onClick={() => { if (!o.disabled) onPick(); }}
      onKeyDown={onKeyDown}
      {...focusProps}
    >
      <i className={focusVisible ? 'is-focus' : undefined} />
      {o.description ? <span><b>{o.label}</b><small>{o.description}</small></span> : o.label}
    </div>
  );
}

/** 單選清單：2–5 個互斥選項、選項都看得到。方向鍵切換。規則在 core/choice.ts。 */
/** 表單：受控 value＋onChange，或非受控 defaultValue＋name；disabled＝整組停用 */
export const RadioGroup = forwardRef<HTMLElement, RadioGroupProps>(function RadioGroup({ options: list, value: v, defaultValue, onChange, single, disabled, name, onBlur, className, style, ...aria }, fref) {
  const ref = useRef<HTMLDivElement>(null);
  useFieldRef(fref, ref, '[role="radio"][tabindex="0"]');
  const [value, set] = useControlled<string | undefined>(v, defaultValue, onChange as ((v: string | undefined) => void) | undefined, undefined);
  const options = disabled ? list.map((o) => ({ ...o, disabled: true })) : list;
  const leave = leaveHandler(onBlur);
  const hidden = <FormValue name={name} value={value ?? ''} disabled={disabled} />;
  const move = (from: number, d: 1 | -1) => {
    const i = radioMove(options, from, d);
    if (i < 0) return;
    set(options[i].value);
    if (ref.current) focusNth(ref.current, '[role="radio"]', i);
  };
  const items = options.map((o, i) => (
    <Radio key={o.value} o={o} on={o.value === value} tabIndex={radioTabIndex(options, value, i)} onPick={() => set(o.value)} onArrow={(d) => move(i, d)} />
  ));
  if (single) return <div ref={ref} role="radiogroup" aria-label={aria['aria-label']} style={{ display: 'contents' }} onBlur={leave}>{items}{hidden}</div>;
  return <div ref={ref} role="radiogroup" aria-label={aria['aria-label']} className={cx('rads', className)} style={styleOf(style)} onBlur={leave}>{items}{hidden}</div>;
});
