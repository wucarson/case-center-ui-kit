import { forwardRef, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { focusNth, segmentedClass, segmentedColumns, segmentedKey, segmentedThumb } from '@wucarson/facet-core/choice';
import { FormValue, leaveHandler, useControlled, useFieldRef, type FieldProps } from './form';
import { cx, styleOf } from './util';

export interface SegmentedProps extends FieldProps {
  /** 2–4 個互斥選項 */
  options: string[];
  /** 受控：選中的索引 */
  value?: number;
  /** 非受控：初始索引 */
  defaultValue?: number;
  onChange?: (index: number) => void;
  'aria-label'?: string;
  /** sm＝對話框、卡片內 */
  size?: 'md' | 'sm';
  className?: string;
  style?: string | CSSProperties;
}

/** 分段切換：選中片彈性滑動。左右鍵切換。規則在 core/choice.ts。 */
/** 表單：值是選中的索引。disabled＝不能切換（展示牆尚無停用樣式） */
export const Segmented = forwardRef<HTMLElement, SegmentedProps>(function Segmented({ options, value: v, defaultValue, onChange, size = 'md', disabled, name, onBlur, className, style, ...aria }, fref) {
  const ref = useRef<HTMLDivElement>(null);
  useFieldRef(fref, ref, '[role="radio"].on');
  const [value, set] = useControlled(v, defaultValue, onChange, 0);
  const select = (i: number) => { if (!disabled) set(i); };
  const n = options.length;
  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const r = segmentedKey(e.key, i, n);
    if (!r || disabled) return;
    e.preventDefault();
    set(r.index);
    if (r.focus && ref.current) focusNth(ref.current, '[role="radio"]', r.index);
  };
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={aria['aria-label']}
      aria-disabled={disabled || undefined}
      onBlur={leaveHandler(onBlur)}
      className={cx(segmentedClass(size), className)}
      style={{ gridTemplateColumns: segmentedColumns(n), ...styleOf(style) }}
    >
      <i style={segmentedThumb(n, value)} />
      {options.map((t, i) => (
        <span
          key={t}
          role="radio"
          aria-checked={i === value}
          tabIndex={i === value && !disabled ? 0 : -1}
          className={i === value ? 'on' : undefined}
          onClick={() => select(i)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {t}
        </span>
      ))}
      <FormValue name={name} value={value} disabled={disabled} />
    </div>
  );
});
