import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { onOutsidePointer } from '../../../core/dom';
import {
  MENU_FLOAT_STYLE, focusFirstMenuItem, focusMenuItem, isMenuItemOff, menuItemClass, menuKey, menuSelect, menuTriggerClass,
  type MenuItem,
} from '../../../core/menu';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export type { MenuItem };

/** 選單清單（.mn-p）。↑↓ 移動（停用項也停得到，才念得到原因）、Enter 選取、Esc 關閉。規則在 core/menu.ts。 */
export function MenuPanel({ items, onClose, inline, style, 'aria-label': label }: { items: MenuItem[]; onClose?: () => void; inline?: boolean; style?: CSSProperties; 'aria-label'?: string }) {
  const [cursor, setCursor] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const select = (it: MenuItem) => { if (menuSelect(it)) onClose?.(); };
  const onKeyDown = (e: KeyboardEvent) => {
    const r = menuKey(items, cursor, e.key);
    if (!r) return;
    e.preventDefault();
    if (r.type === 'move') { setCursor(r.index); if (ref.current) focusMenuItem(ref.current, items, r.index); }
    else if (r.type === 'select') select(items[r.index]);
    else onClose?.();
  };
  const panel = (
    <div ref={ref} className="mn-p" role="menu" aria-label={label} style={style} onKeyDown={onKeyDown}>
      {items.map((it, i) => it.separator ? <div key={i} className="mn-sep" role="separator" /> : (
        <div
          key={i}
          role="menuitem"
          tabIndex={-1}
          aria-disabled={isMenuItemOff(it) || undefined}
          className={menuItemClass(it, i === cursor)}
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
    if (!open || !root.current) return;
    const el = root.current;
    const off = onOutsidePointer(el, () => setOpen(false));
    // 打開時焦點落在第一個可用項目
    const raf = requestAnimationFrame(() => focusFirstMenuItem(el));
    return () => { off(); cancelAnimationFrame(raf); };
  }, [open]);
  const close = () => { setOpen(false); btn.current?.focus(); };
  return (
    <div ref={root} className={cx('mn-h', className)} style={{ position: 'relative', ...styleOf(style) }}>
      <button ref={btn} type="button" className={menuTriggerClass(open)} aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="dots" />
      </button>
      {open && items.length > 0 && (
        <MenuPanel items={items} onClose={close} aria-label={label} style={MENU_FLOAT_STYLE} />
      )}
    </div>
  );
}
