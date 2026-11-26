import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { MONTH_NEXT, MONTH_PREV, canPickDay, dateFieldLabel, dateGridKey, dayClass, isDateOpenKey, monthTitle, placeDaySel, shiftView, viewOf } from '@wucarson/facet-core/date';
import { onOutsidePointer } from '@wucarson/facet-core/dom';
import { PRESETS, WEEK, fmtDay, fromISO, monthCells, todayISO } from '@wucarson/facet-core/dates';
import { FormValue, leaveHandler, useControlled, useFieldRef, type FieldProps } from './form';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export interface DatePickerProps extends FieldProps {
  /** 受控：'YYYY-MM-DD'；空字串＝未選 */
  value?: string;
  /** 非受控：初始值 */
  defaultValue?: string;
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
/** 表單：值是 'YYYY-MM-DD'。disabled＝不能展開（展示牆尚無停用樣式）。ref 指向日期欄 */
export const DatePicker = forwardRef<HTMLElement, DatePickerProps>(function DatePicker({ value: v, defaultValue, onChange, label, help, min, today = todayISO(), defaultOpen, disabled, name, onBlur, className, style }, ref) {
  const [value, set] = useControlled(v, defaultValue, onChange, '');
  const [open, setOpen] = useState(!!defaultOpen);
  const [view, setView] = useState(() => viewOf(value || today));
  const [cursor, setCursor] = useState(value || today);
  const root = useRef<HTMLDivElement>(null);
  useFieldRef(ref, root, '.dp-f');
  // 值從外面改了（表單寫入、重設）：月曆跟著跳到那個月
  useEffect(() => { setView(viewOf(value || today)); setCursor(value || today); }, [value]);
  const grid = useRef<HTMLDivElement>(null);
  const sel = useRef<HTMLElement>(null);
  // 點外面關閉：焦點在彈出層裡時，彈出層一移除瀏覽器就不送 blur，先在這裡標記離開（touched）
  const blurRef = useRef(onBlur); blurRef.current = onBlur;
  useEffect(() => (open && root.current ? onOutsidePointer(root.current, () => { if (root.current?.contains(document.activeElement)) blurRef.current?.(); setOpen(false); }) : undefined), [open]);
  useLayoutEffect(() => placeDaySel(grid.current, sel.current), [open, value, view]);
  // 選了就關閉；焦點原本在彈出層裡就回到日期欄（彈出層移除後焦點不會掉到頁面最上方）
  const pick = (d: string) => { if (!canPickDay(d, min)) return; set(d); setOpen(false); if (root.current?.contains(document.activeElement)) root.current.querySelector<HTMLElement>('.dp-f')?.focus(); };
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
    <div ref={root} className={cx('dp', open && 'open', className)} style={styleOf(style)} onBlur={leaveHandler(onBlur)}>
      <div className="dp-f" role="button" tabIndex={disabled ? -1 : 0} aria-disabled={disabled || undefined} aria-label={dateFieldLabel(label, value)} aria-haspopup="dialog" aria-expanded={open} onClick={() => { if (!disabled) setOpen((o) => !o); }} onKeyDown={(e) => { if (!disabled && isDateOpenKey(e.key)) { e.preventDefault(); setOpen(true); } }}>
        <span className="roll"><span>{value ? fmtDay(value) : ''}</span></span><Icon name="calendar" />
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
      <FormValue name={name} value={value} disabled={disabled} />
    </div>
  );
});
