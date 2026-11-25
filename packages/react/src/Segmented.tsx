import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { focusNth, segmentedClass, segmentedColumns, segmentedKey, segmentedThumb } from '@case-center/core/choice';
import { cx, styleOf } from './util';

export interface SegmentedProps {
  /** 2–4 個互斥選項 */
  options: string[];
  /** 選中的索引 */
  value: number;
  onChange?: (index: number) => void;
  'aria-label'?: string;
  /** sm＝對話框、卡片內 */
  size?: 'md' | 'sm';
  className?: string;
  style?: string | CSSProperties;
}

/** 分段切換：選中片彈性滑動。左右鍵切換。規則在 core/choice.ts。 */
export function Segmented({ options, value, onChange, size = 'md', className, style, ...aria }: SegmentedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const n = options.length;
  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const r = segmentedKey(e.key, i, n);
    if (!r) return;
    e.preventDefault();
    onChange?.(r.index);
    if (r.focus && ref.current) focusNth(ref.current, '[role="radio"]', r.index);
  };
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={aria['aria-label']}
      className={cx(segmentedClass(size), className)}
      style={{ gridTemplateColumns: segmentedColumns(n), ...styleOf(style) }}
    >
      <i style={segmentedThumb(n, value)} />
      {options.map((t, i) => (
        <span
          key={t}
          role="radio"
          aria-checked={i === value}
          tabIndex={i === value ? 0 : -1}
          className={i === value ? 'on' : undefined}
          onClick={() => onChange?.(i)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
