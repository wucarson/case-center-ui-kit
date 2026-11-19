import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { MONTH_NEXT, MONTH_PREV, canPickDay, dateFieldLabel, dateGridKey, dayClass, isDateOpenKey, monthTitle, placeDaySel, shiftView, viewOf } from '../../../core/date';
import { onOutsidePointer } from '../../../core/dom';
import { PRESETS, WEEK, fmtDay, fromISO, monthCells, todayISO } from '../../../shared/dates';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export interface DatePickerProps {
  /** 'YYYY-MM-DD' */
  value: string;
  onChange?: (value: string) => void;
  /** 讀屏名稱，例：「結束日期」 */
  label: string;
  /** 欄位下方的說明 */
  help?: string;
  /** 最早可選（之前的日期變淡、不能選） */
  min?: string;
  /** 今天（測試、資料截止日用）；預設是系統今天 */
  today?: string;
  defaultOpen?: boolean;
  className?: string;
  style?: string | CSSProperties;
}

/** 日期選擇：左側快捷（今天、明天、一週後、月底）、右側月曆；選了就生效。方向鍵移動、Enter 選取、Esc 關閉。規則在 core/date.ts。 */
export function DatePicker({ value, onChange, label, help, min, today = todayISO(), defaultOpen, className, style }: DatePickerProps) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [view, setView] = useState(() => viewOf(value || today));
  const [cursor, setCursor] = useState(value || today);
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const sel = useRef<HTMLElement>(null);
  useEffect(() => (open && root.current ? onOutsidePointer(root.current, () => setOpen(false)) : undefined), [open]);
  useLayoutEffect(() => placeDaySel(grid.current, sel.current), [open, value, view]);
  const pick = (d: string) => { if (!canPickDay(d, min)) return; onChange?.(d); setOpen(false); };
  const onGridKey = (e: KeyboardEvent) => {
    const r = dateGridKey(cursor, e.key);
    if (!r) return;
    e.preventDefault();
    if (r.type === 'move') { setCursor(r.cursor); setView(r.view); }
    else if (r.type === 'pick') pick(cursor);
    else setOpen(false);
  };
  const [y, m] = view;
  return (
    <div ref={root} className={cx('dp', open && 'open', className)} style={styleOf(style)}>
      <div className="dp-f" role="button" tabIndex={0} aria-label={dateFieldLabel(label, value)} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)} onKeyDown={(e) => { if (isDateOpenKey(e.key)) { e.preventDefault(); setOpen(true); } }}>
        <span className="roll"><span>{fmtDay(value)}</span></span><Icon name="calendar" />
      </div>
      {help && <div className="dp-h">{help}</div>}
      {open && (
        <div className="dp-p" role="dialog" aria-label={label}>
          <div className="dp-pre">
            {PRESETS(today).map((p) => (
              <span key={p.label} role="button" tabIndex={0} className={p.value === value ? 'on' : undefined} onClick={() => pick(p.value)} onKeyDown={(e) => { if (e.key === 'Enter') pick(p.value); }}>{p.label}</span>
            ))}
          </div>
          <div className="dp-c">
            <div className="dp-m">
              <span>{monthTitle(view)}</span>
              <span>
                <svg className="ic" viewBox="0 0 24 24" role="button" tabIndex={-1} aria-label="上個月" onClick={() => setView((v) => shiftView(v, -1))} dangerouslySetInnerHTML={{ __html: MONTH_PREV }} />
                <svg className="ic" viewBox="0 0 24 24" role="button" tabIndex={-1} aria-label="下個月" onClick={() => setView((v) => shiftView(v, 1))} dangerouslySetInnerHTML={{ __html: MONTH_NEXT }} />
              </span>
            </div>
            <div ref={grid} className="dp-g" role="grid" tabIndex={0} aria-label={monthTitle(view)} onKeyDown={onGridKey}>
              <i ref={sel} className="dp-sel" />
              {WEEK.split('').map((w) => <b key={w}>{w}</b>)}
              {monthCells(y, m).map((d, i) => d === null ? <span key={'x' + i} aria-hidden="true" /> : (
                <span key={d} role="gridcell" aria-selected={d === value} className={dayClass(d, value, today, min)} onClick={() => pick(d)}>
                  {fromISO(d).getDate()}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
