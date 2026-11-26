import { forwardRef, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { isActivateKey, onOutsidePointer } from '@wucarson/facet-core/dom';
import { filterItems, multiClass, multiFooter, multiKey, multiSearchLabel, multiShowCount, multiText, multiTextClass, multiToggle, multiTriggerLabel } from '@wucarson/facet-core/listbox';
import { Checkbox } from './Checkbox';
import { FormValue, leaveHandler, useControlled, useFieldRef, type FieldProps } from './form';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export interface MultiSelectProps extends FieldProps {
  options: string[];
  /** 受控：已選；空陣列＝全部 */
  value?: string[];
  /** 非受控：初始值 */
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** 「部門」「客戶」：按鈕字、搜尋提示、底部說明都用它 */
  noun: string;
  /** 量詞：部門用「個」 */
  unit?: string;
  /** 單選：選一個就生效並關閉 */
  single?: boolean;
  /** 放在 FormField 裡：只輸出文字與箭頭，外框由 FormField 畫 */
  inField?: boolean;
  /** 清單跟在按鈕下方、不浮起 */
  inlineMenu?: boolean;
  defaultOpen?: boolean;
  defaultQuery?: string;
  'aria-label'?: string;
  className?: string;
  style?: string | CSSProperties;
}

/** 多選下拉：從清單勾選多個；沒選＝全部。按鈕列出已選名稱和數量。規則在 core/listbox.ts。 */
/** 表單：值是 string[]。disabled＝不能展開（單獨使用時展示牆尚無停用樣式）。ref 指向按鈕 */
export const MultiSelect = forwardRef<HTMLElement, MultiSelectProps>(function MultiSelect({ options, value: v, defaultValue, onChange, noun, unit = '個', single, inField, inlineMenu, defaultOpen, defaultQuery, disabled, name, onBlur, className, style, ...aria }, ref) {
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  useFieldRef(ref, root, '.ms-t');
  const [value, set] = useControlled<string[]>(v, defaultValue, onChange, []);
  const hidden = <FormValue name={name} value={value} disabled={disabled} />;
  const [open, setOpen] = useState(!!defaultOpen);
  const [query, setQuery] = useState(defaultQuery ?? '');
  const shown = useMemo(() => filterItems(options, query), [options, query]);
  // 點外面關閉：焦點在彈出層裡時，彈出層一移除瀏覽器就不送 blur，先在這裡標記離開（touched）
  const blurRef = useRef(onBlur); blurRef.current = onBlur;
  useEffect(() => (open && root.current ? onOutsidePointer(root.current, () => { if (root.current?.contains(document.activeElement)) blurRef.current?.(); setOpen(false); }) : undefined), [open]);
  const toggle = (t: string) => { set(multiToggle(value, t, single)); if (single) setOpen(false); };
  const onKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;
    const r = multiKey(open, e.key);
    if (r) { e.preventDefault(); setOpen(r === 'open'); }
  };
  const textEl = <span className={multiTextClass(value)}>{multiText(value, noun)}</span>;
  if (inField) return <>{textEl}<span className="unit" aria-hidden="true"><Icon name="chevronDown" /></span>{hidden}</>;
  return (
    <div ref={root} className={cx(multiClass({ open, inlineMenu }), className)} style={styleOf(style)} onBlur={leaveHandler(onBlur)}>
      <div className="ms-t" role="combobox" tabIndex={disabled ? -1 : 0} aria-disabled={disabled || undefined} aria-expanded={open} aria-controls={listId} aria-haspopup="listbox" aria-label={multiTriggerLabel(noun, aria['aria-label'])} onClick={() => { if (!disabled) setOpen((o) => !o); }} onKeyDown={onKeyDown}>
        {textEl}
        {multiShowCount(value, single) && <span className="ms-n">{value.length}</span>}
        <Icon name="chevronDown" />
      </div>
      {open && (
        <div className="ms-p" id={listId} role="listbox" aria-multiselectable={!single}>
          <div className="ms-s"><Icon name="search" /><input aria-label={multiSearchLabel(noun)} placeholder={multiSearchLabel(noun)} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown} /></div>
          <div className="ms-l">
            {shown.map((t) => <Checkbox key={t} label={t} checked={value.includes(t)} onChange={() => toggle(t)} />)}
          </div>
          <div className="ms-f">
            <span>{multiFooter(value, noun, unit)}</span>
            <u role="button" tabIndex={0} onClick={() => set([])} onKeyDown={(e) => { if (isActivateKey(e.key)) { e.preventDefault(); set([]); } }}>清除</u>
          </div>
        </div>
      )}
      {hidden}
    </div>
  );
});
