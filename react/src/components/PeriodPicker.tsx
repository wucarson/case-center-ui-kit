import { useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { PERIODS, fmtRange, periodRange, todayISO, type PeriodKey } from '../../../shared/dates';
import { Icon } from './Icon';
import { styleOf } from './util';

export interface PeriodPickerProps {
  value: PeriodKey;
  onChange?: (value: PeriodKey) => void;
  /** 「自訂」的起訖 'YYYY-MM-DD' */
  custom?: [string, string];
  /** 今天（測試、資料截止日用）；預設是系統今天 */
  today?: string;
  className?: string;
  style?: string | CSSProperties;
}

/** 期間選擇：本月、近 30 天、近 90 天或自訂；範圍以文字寫出。選中片滑動，左右鍵切換。 */
export function PeriodPicker({ value, onChange, custom, today = todayISO(), className, style }: PeriodPickerProps) {
  const ps = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLElement>(null);
  const cur = PERIODS.findIndex((p) => p.key === value);
  // 選中片：量選中項目的位置（量法同展示牆）
  useLayoutEffect(() => {
    const on = ps.current?.querySelector<HTMLElement>(':scope > span.on');
    if (on && pill.current) { pill.current.style.width = `${on.offsetWidth}px`; pill.current.style.transform = `translateX(${on.offsetLeft}px)`; }
  }, [value]);
  const onKeyDown = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (cur + d + PERIODS.length) % PERIODS.length;
    onChange?.(PERIODS[n].key);
    ps.current?.querySelectorAll<HTMLElement>('[role="radio"]')[n]?.focus();
  };
  return (
    <div className={className} style={styleOf(style)}>
      <div ref={ps} className="ps" role="radiogroup" aria-label="期間" onKeyDown={onKeyDown}>
        <i ref={pill} />
        {PERIODS.map((p, i) => (
          <span key={p.key} role="radio" aria-checked={i === cur} tabIndex={i === cur ? 0 : -1} className={i === cur ? 'on' : undefined} onClick={() => onChange?.(p.key)}>
            {p.label}{p.key === 'custom' && <Icon name="chevronDown" />}
          </span>
        ))}
      </div>
      <div className="ps-r">{fmtRange(periodRange(value, today, custom))}</div>
    </div>
  );
}
