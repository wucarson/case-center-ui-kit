import { forwardRef, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { onOutsidePointer } from '@wucarson/facet-core/dom';
import { COMBO_EMPTY, comboClass, comboIcon, comboKey, comboListId, comboOptionClass, comboOptionId, filterItems } from '@wucarson/facet-core/listbox';
import { FormValue, leaveHandler, useControlled, useFieldRef, type FieldProps } from './form';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export interface ComboProps extends FieldProps {
  items: string[];
  /** 受控：選中的值 */
  value?: string;
  /** 非受控：初始值 */
  defaultValue?: string;
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

/** 下拉選單：從固定清單選一個值；打字可篩選。↑↓ 移動、Enter 選取、Esc 關閉。規則在 core/listbox.ts。 */
/** 表單：受控 value＋onChange，或非受控 defaultValue＋name。ref 指向輸入框 */
export const Combo = forwardRef<HTMLInputElement, ComboProps>(function Combo({ items, value: v, defaultValue, onChange, placeholder, label, selfLabelled, invalid, inField, inlineMenu, defaultOpen, defaultQuery, id, disabled, name, onBlur, className, style }, ref) {
  const [value, set] = useControlled(v, defaultValue, onChange, '');
  const leave = leaveHandler(onBlur);
  const hidden = <FormValue name={name} value={value} disabled={disabled} />;
  const auto = useId();
  const inputId = id ?? auto;
  const listId = comboListId(inputId);
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(!!defaultOpen);
  const [query, setQuery] = useState<string | null>(defaultQuery ?? null);
  const [cursor, setCursor] = useState(defaultQuery ? 0 : -1);
  const shown = useMemo(() => filterItems(items, query), [items, query]);
  const close = () => { setOpen(false); setQuery(null); setCursor(-1); };
  useEffect(() => (open && root.current ? onOutsidePointer(root.current, close) : undefined), [open]);
  const pick = (t: string) => { set(t); close(); };
  const onKeyDown = (e: KeyboardEvent) => {
    const r = comboKey(open, cursor, shown.length, e.key);
    if (!r) return;
    e.preventDefault();
    if (r.type === 'open') setOpen(true);
    else if (r.type === 'move') setCursor(r.index);
    else if (r.type === 'pick') pick(shown[r.index]);
    else close();
  };
  const input = (
    <input
      ref={ref}
      id={inputId}
      role="combobox"
      disabled={disabled}
      aria-expanded={open}
      aria-controls={listId}
      aria-activedescendant={open && cursor >= 0 ? comboOptionId(inputId, cursor) : undefined}
      aria-autocomplete="list"
      aria-invalid={invalid || undefined}
      aria-label={selfLabelled ? label : undefined}
      autoComplete="off"
      placeholder={placeholder}
      value={query ?? value}
      onChange={(e) => { setQuery(e.target.value); setOpen(true); setCursor(0); }}
      onFocus={() => setOpen(true)}
      onKeyDown={onKeyDown}
      onBlur={inField ? leave : undefined}
    />
  );
  const menu = open && (
    <div className="dd-m" id={listId} role="listbox" aria-label={label}>
      {shown.length ? shown.map((t, i) => (
        <div key={t} id={comboOptionId(inputId, i)} role="option" aria-selected={t === value} className={comboOptionClass(t === value, i === cursor) || undefined} onMouseDown={(e) => { e.preventDefault(); pick(t); }} onMouseMove={() => setCursor(i)}>
          {t}<Icon name="check" />
        </div>
      )) : <div className="none">{COMBO_EMPTY}</div>}
    </div>
  );
  if (inField) {
    return (
      <>
        {input}
        <span className="unit" aria-hidden="true"><Icon name="chevronDown" /></span>
        {menu}
        {hidden}
      </>
    );
  }
  return (
    <div ref={root} className={cx(comboClass({ open, inlineMenu, invalid }), disabled && 'dis', className)} style={styleOf(style)} onBlur={leave}>
      <div className="dd-t">{input}<Icon name={comboIcon(open)} /></div>
      {menu}
      {hidden}
    </div>
  );
});
