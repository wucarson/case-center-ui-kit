import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
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

/** 分段切換：選中片彈性滑動。左右鍵切換。 */
export function Segmented({ options, value, onChange, size = 'md', className, style, ...aria }: SegmentedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const n = options.length;
  const pick = (i: number, focus = false) => {
    onChange?.(i);
    if (focus) ref.current?.querySelectorAll<HTMLElement>('[role="radio"]')[i]?.focus();
  };
  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (d) { e.preventDefault(); pick((i + d + n) % n, true); }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(i); }
  };
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={aria['aria-label']}
      className={cx('seg', size === 'sm' && 'sm', className)}
      style={{ gridTemplateColumns: `repeat(${n},1fr)`, ...styleOf(style) }}
    >
      <i style={{ width: `calc((100% - 6px) / ${n})`, transform: `translateX(${value * 100}%)` }} />
      {options.map((t, i) => (
        <span
          key={t}
          role="radio"
          aria-checked={i === value}
          tabIndex={i === value ? 0 : -1}
          className={i === value ? 'on' : undefined}
          onClick={() => pick(i)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
