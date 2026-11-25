import type { CSSProperties, KeyboardEvent } from 'react';
import { TIME_COLS, pad2, parseTime, timeKey, timeStep, type TimePart } from '@wucarson/facet-core/time';
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

/** 時間選擇：時、分各自上下調（各自循環，不互相進位）。數值格可聚焦，↑↓ 調整。規則在 core/time.ts。 */
export function TimePicker({ value, onChange, label, step = 5, className, style }: TimePickerProps) {
  const hm = parseTime(value);
  const inc = (part: TimePart, d: 1 | -1) => onChange?.(timeStep(value, part, d, step));
  const onKeyDown = (part: TimePart) => (e: KeyboardEvent) => { const d = timeKey(e.key); if (d) { e.preventDefault(); inc(part, d); } };
  return (
    <div className={cx('tp', className)} style={styleOf(style)} role="group" aria-label={label}>
      <div className="tp-f" aria-hidden="true"><span className="roll"><span>{value}</span></span><Icon name="clock" /></div>
      <div className="tp-c">
        {TIME_COLS.map((c, i) => [
          i === 1 && <b key="sep">:</b>,
          <div key={c.part} className="tp-col">
            <u role="button" tabIndex={-1} aria-label={`${c.name}加一`} onClick={() => inc(c.part, 1)}><Icon name="chevronUp" /></u>
            <span className="v" role="spinbutton" tabIndex={0} aria-label={c.name} aria-valuenow={hm[i]} aria-valuemin={0} aria-valuemax={c.max} onKeyDown={onKeyDown(c.part)}>
              <span className="roll"><span>{pad2(hm[i])}</span></span>
            </span>
            <u role="button" tabIndex={-1} aria-label={`${c.name}減一`} onClick={() => inc(c.part, -1)}><Icon name="chevronDown" /></u>
          </div>,
        ])}
      </div>
    </div>
  );
}
