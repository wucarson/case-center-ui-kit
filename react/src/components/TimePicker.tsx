import type { CSSProperties, KeyboardEvent } from 'react';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export interface TimePickerProps {
  /** 'HH:mm' */
  value: string;
  onChange?: (value: string) => void;
  /** 讀屏名稱，例：「開始時間」 */
  label: string;
  /** 分鐘每次調整幾分（預設 5） */
  step?: number;
  className?: string;
  style?: string | CSSProperties;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** 時間選擇：時、分各自上下調（各自循環，不互相進位）。數值格可聚焦，↑↓ 調整。 */
export function TimePicker({ value, onChange, label, step = 5, className, style }: TimePickerProps) {
  const [h, m] = value.split(':').map(Number);
  const set = (hh: number, mm: number) => onChange?.(`${pad((hh + 24) % 24)}:${pad((mm + 60) % 60)}`);
  const col = (part: 'h' | 'm', v: number, name: string) => {
    const inc = (d: number) => (part === 'h' ? set(h + d, m) : set(h, m + d * step));
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); inc(1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); inc(-1); }
    };
    return (
      <div className="tp-col">
        <u role="button" tabIndex={-1} aria-label={`${name}加一`} onClick={() => inc(1)}><Icon name="chevronUp" /></u>
        <span className="v" role="spinbutton" tabIndex={0} aria-label={name} aria-valuenow={v} aria-valuemin={0} aria-valuemax={part === 'h' ? 23 : 59} onKeyDown={onKeyDown}>
          <span className="roll"><span>{pad(v)}</span></span>
        </span>
        <u role="button" tabIndex={-1} aria-label={`${name}減一`} onClick={() => inc(-1)}><Icon name="chevronDown" /></u>
      </div>
    );
  };
  return (
    <div className={cx('tp', className)} style={styleOf(style)} role="group" aria-label={label}>
      <div className="tp-f" aria-hidden="true"><span className="roll"><span>{value}</span></span><Icon name="clock" /></div>
      <div className="tp-c">
        {col('h', h, '時')}
        <b>:</b>
        {col('m', m, '分')}
      </div>
    </div>
  );
}
