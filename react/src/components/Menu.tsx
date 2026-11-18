import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { IconName } from '../../../shared/icons';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export type MenuItem =
  | { separator: true }
  | {
      separator?: false;
      label: string;
      icon?: IconName;
      /** 刪除類：放最後、前面加分隔線，紅字 */
      danger?: boolean;
      /** 停用時寫出原因（不要藏起來） */
      disabledReason?: string;
      disabled?: boolean;
      onSelect?: () => void;
    };

/** 選單清單（.mn-p）。↑↓ 移動（停用項也停得到，才念得到原因）、Enter 選取、Esc 關閉。 */
export function MenuPanel({ items, onClose, inline, style, 'aria-label': label }: { items: MenuItem[]; onClose?: () => void; inline?: boolean; style?: CSSProperties; 'aria-label'?: string }) {
  const [cursor, setCursor] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const idx = items.map((it, i) => (it.separator ? -1 : i)).filter((i) => i >= 0);
  const focusAt = (i: number) => { setCursor(i); ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')[idx.indexOf(i)]?.focus(); };
  const select = (it: MenuItem) => { if (it.separator || it.disabled || it.disabledReason) return; it.onSelect?.(); onClose?.(); };
  const onKeyDown = (e: KeyboardEvent) => {
    const k = idx.indexOf(cursor);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); focusAt(idx[(k + (e.key === 'ArrowDown' ? 1 : -1) + idx.length) % idx.length]); }
    else if (e.key === 'Home') { e.preventDefault(); focusAt(idx[0]); }
    else if (e.key === 'End') { e.preventDefault(); focusAt(idx[idx.length - 1]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose?.(); }
    else if ((e.key === 'Enter' || e.key === ' ') && cursor >= 0) { e.preventDefault(); select(items[cursor]); }
  };
  const panel = (
    <div ref={ref} className="mn-p" role="menu" aria-label={label} style={style} onKeyDown={onKeyDown}>
      {items.map((it, i) => it.separator ? <div key={i} className="mn-sep" role="separator" /> : (
        <div
          key={i}
          role="menuitem"
          tabIndex={-1}
          aria-disabled={it.disabled || !!it.disabledReason || undefined}
          className={cx('mn-i', it.danger && 'dng', (it.disabled || it.disabledReason) && 'dis', i === cursor && 'hl')}
          onMouseEnter={() => setCursor(i)}
          onMouseLeave={() => setCursor(-1)}
          onClick={() => select(it)}
        >
          {it.icon && <Icon name={it.icon} />}{it.label}{it.disabledReason && <small>{it.disabledReason}</small>}
        </div>
      ))}
    </div>
  );
  return inline ? <div className="mn pin">{panel}</div> : panel;
}

export interface MenuProps {
  items: MenuItem[];
  /** 觸發鈕的讀屏名稱，例：「更多操作：現場設備異常排查」 */
  label: string;
  defaultOpen?: boolean;
  className?: string;
  style?: string | CSSProperties;
}

/** 操作選單：⋯ 收起次要動作。觸發鈕＋浮起的清單（靠右對齊）。 */
export function Menu({ items, label, defaultOpen, className, style }: MenuProps) {
  const [open, setOpen] = useState(!!defaultOpen);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', off);
    // 打開時焦點落在第一個可用項目
    requestAnimationFrame(() => root.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus());
    return () => document.removeEventListener('mousedown', off);
  }, [open]);
  const close = () => { setOpen(false); btn.current?.focus(); };
  return (
    <div ref={root} className={cx('mn-h', className)} style={{ position: 'relative', ...styleOf(style) }}>
      <button ref={btn} type="button" className={cx('b2', 'ico', open && 'on')} aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="dots" />
      </button>
      {open && items.length > 0 && (
        <MenuPanel items={items} onClose={close} aria-label={label} style={{ width: 210, opacity: 1, transform: 'none', zIndex: 20 }} />
      )}
    </div>
  );
}
