import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export interface ComboProps {
  items: string[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** 欄位名稱：給清單與展開鈕念 */
  label: string;
  /** 沒有外部 <label> 時打開，用 label 命名輸入框 */
  selfLabelled?: boolean;
  invalid?: boolean;
  /** 放在 FormField 裡：只輸出輸入框與箭頭，外框由 FormField 畫 */
  inField?: boolean;
  /** 清單跟在欄位下方、不浮起（放在對話框、面板裡） */
  inlineMenu?: boolean;
  defaultOpen?: boolean;
  defaultQuery?: string;
  id?: string;
  className?: string;
  style?: string | CSSProperties;
}

/** 下拉選單：從固定清單選一個值；打字可篩選。↑↓ 移動、Enter 選取、Esc 關閉。 */
export function Combo({ items, value = '', onChange, placeholder, label, selfLabelled, invalid, inField, inlineMenu, defaultOpen, defaultQuery, id, className, style }: ComboProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const listId = inputId + '-list';
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(!!defaultOpen);
  const [query, setQuery] = useState<string | null>(defaultQuery ?? null);
  const [cursor, setCursor] = useState(defaultQuery ? 0 : -1);
  const shown = useMemo(() => (query ? items.filter((t) => t.includes(query)) : items), [items, query]);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) close(); };
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, [open]);
  const close = () => { setOpen(false); setQuery(null); setCursor(-1); };
  const pick = (t: string) => { onChange?.(t); close(); };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      const d = e.key === 'ArrowDown' ? 1 : -1;
      setCursor((c) => (shown.length ? (c + d + shown.length) % shown.length : -1));
    } else if (e.key === 'Enter' && open && shown[cursor]) { e.preventDefault(); pick(shown[cursor]); }
    else if (e.key === 'Escape' && open) { e.preventDefault(); close(); }
  };
  const input = (
    <input
      id={inputId}
      role="combobox"
      aria-expanded={open}
      aria-controls={listId}
      aria-activedescendant={open && cursor >= 0 ? `${inputId}-opt-${cursor}` : undefined}
      aria-autocomplete="list"
      aria-invalid={invalid || undefined}
      aria-label={selfLabelled ? label : undefined}
      autoComplete="off"
      placeholder={placeholder}
      value={query ?? value}
      onChange={(e) => { setQuery(e.target.value); setOpen(true); setCursor(0); }}
      onFocus={() => setOpen(true)}
      onKeyDown={onKeyDown}
    />
  );
  const menu = open && (
    <div className="dd-m" id={listId} role="listbox" aria-label={label}>
      {shown.length ? shown.map((t, i) => (
        <div key={t} id={`${inputId}-opt-${i}`} role="option" aria-selected={t === value} className={cx(t === value && 'sel', i === cursor && 'hl')} onMouseDown={(e) => { e.preventDefault(); pick(t); }} onMouseMove={() => setCursor(i)}>
          {t}<Icon name="check" />
        </div>
      )) : <div className="none">沒有符合的選項</div>}
    </div>
  );
  if (inField) {
    return (
      <>
        {input}
        <span className="unit" aria-hidden="true"><Icon name="chevronDown" /></span>
        {menu}
      </>
    );
  }
  return (
    <div ref={root} className={cx('dd', open && 'open', open && inlineMenu && 'pin', invalid && 'bad', className)} style={styleOf(style)}>
      <div className="dd-t">{input}<Icon name={open ? 'search' : 'chevronDown'} /></div>
      {menu}
    </div>
  );
}
