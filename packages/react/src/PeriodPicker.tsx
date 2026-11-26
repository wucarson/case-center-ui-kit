import { forwardRef, useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { focusNth } from '@wucarson/facet-core/choice';
import { periodIndex, periodKey, periodText, placePeriodPill } from '@wucarson/facet-core/date';
import { PERIODS, todayISO, type PeriodKey } from '@wucarson/facet-core/dates';
import { Icon } from './Icon';
import { FormValue, leaveHandler, useControlled, useFieldRef, type FieldProps } from './form';
import { cx, styleOf } from './util';

export interface PeriodPickerProps extends FieldProps {
  /** 受控：期間代碼 */
  value?: PeriodKey;
  /** 非受控：初始值 */
  defaultValue?: PeriodKey;
  onChange?: (value: PeriodKey) => void;
  /** 「自訂」的起訖 'YYYY-MM-DD' */
  custom?: [string, string];
  /** 今天（測試、資料截止日用）；預設是系統今天 */
  today?: string;
  className?: string;
  style?: string | CSSProperties;
}

/** 期間選擇：本月、近 30 天、近 90 天或自訂；範圍以文字寫出。選中片滑動，左右鍵切換。規則在 core/date.ts。 */
/** 表單：值是期間代碼。disabled＝不能切換（展示牆尚無停用樣式） */
export const PeriodPicker = forwardRef<HTMLElement, PeriodPickerProps>(function PeriodPicker({ value: v, defaultValue, onChange, custom, today = todayISO(), disabled, name, onBlur, className, style }, fref) {
  const ps = useRef<HTMLDivElement>(null);
  useFieldRef(fref, ps, '[role="radio"].on');
  const [value, set] = useControlled<PeriodKey>(v, defaultValue, onChange, 'month');
  const select = (k: PeriodKey) => { if (!disabled) set(k); };
  const pill = useRef<HTMLElement>(null);
  const cur = periodIndex(value);
  useLayoutEffect(() => placePeriodPill(ps.current, pill.current), [value]);
  const onKeyDown = (e: KeyboardEvent) => {
    const n = periodKey(cur, e.key);
    if (n === null || disabled) return;
    e.preventDefault();
    set(PERIODS[n].key);
    if (ps.current) focusNth(ps.current, '[role="radio"]', n);
  };
  return (
    <div className={className} style={styleOf(style)} onBlur={leaveHandler(onBlur)}>
      <div ref={ps} className={cx('ps', disabled && 'dis')} role="radiogroup" aria-label="期間" aria-disabled={disabled || undefined} onKeyDown={onKeyDown}>
        <i ref={pill} />
        {PERIODS.map((p, i) => (
          <span key={p.key} role="radio" aria-checked={i === cur} tabIndex={i === cur && !disabled ? 0 : -1} className={i === cur ? 'on' : undefined} onClick={() => select(p.key)}>
            {p.label}{p.key === 'custom' && <Icon name="chevronDown" />}
          </span>
        ))}
      </div>
      <div className="ps-r">{periodText(value, today, custom)}</div>
      <FormValue name={name} value={value} disabled={disabled} />
    </div>
  );
});
