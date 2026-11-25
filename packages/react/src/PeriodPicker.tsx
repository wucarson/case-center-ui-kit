import { useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { focusNth } from '@case-center/core/choice';
import { periodIndex, periodKey, periodText, placePeriodPill } from '@case-center/core/date';
import { PERIODS, todayISO, type PeriodKey } from '@case-center/core/dates';
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

/** 期間選擇：本月、近 30 天、近 90 天或自訂；範圍以文字寫出。選中片滑動，左右鍵切換。規則在 core/date.ts。 */
export function PeriodPicker({ value, onChange, custom, today = todayISO(), className, style }: PeriodPickerProps) {
  const ps = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLElement>(null);
  const cur = periodIndex(value);
  useLayoutEffect(() => placePeriodPill(ps.current, pill.current), [value]);
  const onKeyDown = (e: KeyboardEvent) => {
    const n = periodKey(cur, e.key);
    if (n === null) return;
    e.preventDefault();
    onChange?.(PERIODS[n].key);
    if (ps.current) focusNth(ps.current, '[role="radio"]', n);
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
      <div className="ps-r">{periodText(value, today, custom)}</div>
    </div>
  );
}
