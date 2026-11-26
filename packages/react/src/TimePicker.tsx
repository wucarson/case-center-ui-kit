import { forwardRef, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { TIME_COLS, pad2, parseTime, timeKey, timeStep, type TimePart } from '@wucarson/facet-core/time';
import { Icon } from './Icon';
import { FormValue, leaveHandler, useControlled, useFieldRef, type FieldProps } from './form';
import { cx, styleOf } from './util';

export interface TimePickerProps extends FieldProps {
  /** 受控：'HH:mm' */
  value?: string;
  /** 非受控：初始值 */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 讀屏名稱，例：「開始時間」 */
  label: string;
  /** 分鐘每次調整幾分（預設 5） */
  step?: number;
  className?: string;
  style?: string | CSSProperties;
}

/** 時間選擇：時、分各自上下調（各自循環，不互相進位）。數值格可聚焦，↑↓ 調整。規則在 core/time.ts。 */
/** 表單：值是 'HH:mm'。disabled＝不能調整（展示牆尚無停用樣式） */
export const TimePicker = forwardRef<HTMLElement, TimePickerProps>(function TimePicker({ value: v, defaultValue, onChange, label, step = 5, disabled, name, onBlur, className, style }, fref) {
  const root = useRef<HTMLDivElement>(null);
  useFieldRef(fref, root, '[role="spinbutton"]');
  const [value, set] = useControlled(v, defaultValue, onChange, '00:00');
  const hm = parseTime(value);
  const inc = (part: TimePart, d: 1 | -1) => { if (!disabled) set(timeStep(value, part, d, step)); };
  const onKeyDown = (part: TimePart) => (e: KeyboardEvent) => { const d = timeKey(e.key); if (d) { e.preventDefault(); inc(part, d); } };
  return (
    <div className={cx('tp', disabled && 'dis', className)} style={styleOf(style)} role="group" aria-label={label} aria-disabled={disabled || undefined} ref={root} onBlur={leaveHandler(onBlur)}>
      <div className="tp-f" aria-hidden="true"><span className="roll"><span>{value}</span></span><Icon name="clock" /></div>
      <div className="tp-c">
        {TIME_COLS.map((c, i) => [
          i === 1 && <b key="sep">:</b>,
          <div key={c.part} className="tp-col">
            <u role="button" tabIndex={-1} aria-label={`${c.name}加一`} onClick={() => inc(c.part, 1)}><Icon name="chevronUp" /></u>
            <span className="v" role="spinbutton" tabIndex={disabled ? -1 : 0} aria-label={c.name} aria-valuenow={hm[i]} aria-valuemin={0} aria-valuemax={c.max} onKeyDown={onKeyDown(c.part)}>
              <span className="roll"><span>{pad2(hm[i])}</span></span>
            </span>
            <u role="button" tabIndex={-1} aria-label={`${c.name}減一`} onClick={() => inc(c.part, -1)}><Icon name="chevronDown" /></u>
          </div>,
        ])}
      </div>
      <FormValue name={name} value={value} disabled={disabled} />
    </div>
  );
});
