import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon } from './Icon';
import { cx, styleOf, useFocusVisible } from './util';

export interface InfoPopoverProps {
  /** 標籤（ⓘ 放在它後面） */
  label: string;
  /** 說明：只寫重點，不放操作 */
  children: ReactNode;
  /** 指標值與補充（選用），例：68%、3 / 5 個里程碑 */
  value?: ReactNode;
  valueNote?: ReactNode;
  defaultOpen?: boolean;
  /** 滑過多久打開（ms，預設 150） */
  openDelay?: number;
  className?: string;
  style?: string | CSSProperties;
}

/** 資訊提示：滑過 150ms 打開、點擊釘住、Esc 關閉。氣泡箭頭對準 ⓘ。 */
export function InfoPopover({ label, children, value, valueNote, defaultOpen, openDelay = 150, className, style }: InfoPopoverProps) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [pinned, setPinned] = useState(false);
  const { focusVisible, focusProps } = useFocusVisible();
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLSpanElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const timer = useRef<number>();
  // 箭頭位置：ⓘ 的中心（相對氣泡左緣），量法同展示牆
  useLayoutEffect(() => {
    if (open && btn.current && pop.current) pop.current.style.setProperty('--ax', `${btn.current.offsetLeft + btn.current.offsetWidth / 2 - pop.current.offsetLeft}px`);
  }, [open]);
  useEffect(() => {
    if (!pinned) return;
    const off = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) { setPinned(false); setOpen(false); } };
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, [pinned]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const enter = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(true), openDelay); };
  const leave = () => { window.clearTimeout(timer.current); if (!pinned) setOpen(false); };
  const toggle = () => { const p = !pinned; setPinned(p); setOpen(p); };
  const id = useRef(`ip-${Math.random().toString(36).slice(2)}`).current;
  return (
    <div ref={root} className={cx('ip', className)} style={styleOf(style)}>
      <div className="ip-l">
        {label}
        <span
          ref={btn}
          className={cx('ip-b', focusVisible && 'fc')}
          role="button"
          tabIndex={0}
          aria-label={`${label}：說明`}
          aria-expanded={open}
          aria-describedby={open ? id : undefined}
          onMouseEnter={enter}
          onMouseLeave={leave}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
            if (e.key === 'Escape') { setPinned(false); setOpen(false); }
          }}
          {...focusProps}
        >
          <Icon name="info" />
        </span>
      </div>
      {value !== undefined && <div className="ip-v">{value}{valueNote && <small>{valueNote}</small>}</div>}
      {open && <div ref={pop} id={id} className="ip-p show" role="tooltip">{children}</div>}
    </div>
  );
}
