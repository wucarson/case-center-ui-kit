import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { PRESETS, WEEK, addDays, fmtDay, fromISO, monthCells, todayISO } from '../../../shared/dates';
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

/** 日期選擇：左側快捷（今天、明天、一週後、月底）、右側月曆；選了就生效。方向鍵移動、Enter 選取、Esc 關閉。 */
export function DatePicker({ value, onChange, label, help, min, today = todayISO(), defaultOpen, className, style }: DatePickerProps) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [view, setView] = useState(() => { const d = fromISO(value || today); return [d.getFullYear(), d.getMonth()] as [number, number]; });
  const [cursor, setCursor] = useState(value || today);
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const sel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, [open]);
  // 選中的圓：量選中日期格的位置（量法同展示牆）
  useLayoutEffect(() => {
    const on = grid.current?.querySelector<HTMLElement>('span.on');
    if (sel.current) {
      sel.current.style.display = on ? '' : 'none';
      if (on) sel.current.style.transform = `translate(${on.offsetLeft + (on.offsetWidth - 32) / 2}px, ${on.offsetTop + (on.offsetHeight - 32) / 2}px)`;
    }
  }, [open, value, view]);
  const pick = (d: string) => { if (min && d < min) return; onChange?.(d); setOpen(false); };
  const shift = (n: number) => setView(([y, m]) => { const d = new Date(y, m + n, 1); return [d.getFullYear(), d.getMonth()]; });
  const onGridKey = (e: KeyboardEvent) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key as string];
    if (step) { e.preventDefault(); const c = addDays(cursor, step); setCursor(c); const d = fromISO(c); setView([d.getFullYear(), d.getMonth()]); }
    if (e.key === 'Enter') { e.preventDefault(); pick(cursor); }
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
  };
  const [y, m] = view;
  return (
    <div ref={root} className={cx('dp', open && 'open', className)} style={styleOf(style)}>
      <div className="dp-f" role="button" tabIndex={0} aria-label={`${label}：${fmtDay(value)}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); } }}>
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
              <span>{y} 年 {m + 1} 月</span>
              <span>
                <svg className="ic" viewBox="0 0 24 24" role="button" tabIndex={-1} aria-label="上個月" onClick={() => shift(-1)} dangerouslySetInnerHTML={{ __html: '<path d="M15 6l-6 6 6 6"/>' }} />
                <svg className="ic" viewBox="0 0 24 24" role="button" tabIndex={-1} aria-label="下個月" onClick={() => shift(1)} dangerouslySetInnerHTML={{ __html: '<path d="M9 6l6 6-6 6"/>' }} />
              </span>
            </div>
            <div ref={grid} className="dp-g" role="grid" tabIndex={0} aria-label={`${y} 年 ${m + 1} 月`} onKeyDown={onGridKey}>
              <i ref={sel} className="dp-sel" />
              {WEEK.split('').map((w) => <b key={w}>{w}</b>)}
              {monthCells(y, m).map((d, i) => d === null ? <span key={'x' + i} aria-hidden="true" /> : (
                <span
                  key={d}
                  role="gridcell"
                  aria-selected={d === value}
                  className={cx(min !== undefined && d < min && 'off', d === today && 'today', d === value && 'on') || undefined}
                  onClick={() => pick(d)}
                >
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
