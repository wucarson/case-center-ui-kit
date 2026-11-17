import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { cx, styleOf, useFocusVisible } from './util';

export interface RadioOption { value: string; label: string; description?: string; disabled?: boolean }

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  'aria-label'?: string;
  /** 只有一個選項、不包外層清單（展示單一狀態用） */
  single?: boolean;
  className?: string;
  style?: string | CSSProperties;
}

function Radio({ o, on, focusable, onPick, onArrow }: { o: RadioOption; on: boolean; focusable: boolean; onPick: () => void; onArrow: (d: number) => void }) {
  const { focusVisible, focusProps } = useFocusVisible();
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onPick(); }
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (d) { e.preventDefault(); onArrow(d); }
  };
  return (
    <div
      role="radio"
      aria-checked={on}
      aria-disabled={o.disabled || undefined}
      tabIndex={o.disabled ? -1 : focusable ? 0 : -1}
      className={cx('rad', on && 'on', o.description && 'tall', o.disabled && 'dis')}
      onClick={() => { if (!o.disabled) onPick(); }}
      onKeyDown={onKeyDown}
      {...focusProps}
    >
      <i className={focusVisible ? 'is-focus' : undefined} />
      {o.description ? <span><b>{o.label}</b><small>{o.description}</small></span> : o.label}
    </div>
  );
}

/** 單選清單：2–5 個互斥選項、選項都看得到。方向鍵切換。 */
export function RadioGroup({ options, value, onChange, single, className, style, ...aria }: RadioGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const cur = options.findIndex((o) => o.value === value);
  const move = (from: number, d: number) => {
    const n = options.length;
    for (let k = 1; k <= n; k++) {
      const i = (from + d * k + n) % n;
      if (!options[i].disabled) { onChange?.(options[i].value); (ref.current?.querySelectorAll<HTMLElement>('[role="radio"]')[i] ?? (ref.current as HTMLElement | null))?.focus(); return; }
    }
  };
  const items = options.map((o, i) => (
    <Radio key={o.value} o={o} on={o.value === value} focusable={cur < 0 ? i === 0 : i === cur} onPick={() => onChange?.(o.value)} onArrow={(d) => move(i, d)} />
  ));
  if (single) return <div ref={ref} role="radiogroup" aria-label={aria['aria-label']} style={{ display: 'contents' }}>{items}</div>;
  return <div ref={ref} role="radiogroup" aria-label={aria['aria-label']} className={cx('rads', className)} style={styleOf(style)}>{items}</div>;
}
