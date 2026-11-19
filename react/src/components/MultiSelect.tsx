import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { isActivateKey, onOutsidePointer } from '../../../core/dom';
import { filterItems, multiClass, multiFooter, multiKey, multiSearchLabel, multiShowCount, multiText, multiTextClass, multiToggle, multiTriggerLabel } from '../../../core/listbox';
import { Checkbox } from './Checkbox';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export interface MultiSelectProps {
  options: string[];
  /** 已選；空陣列＝全部 */
  value: string[];
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
export function MultiSelect({ options, value, onChange, noun, unit = '個', single, inField, inlineMenu, defaultOpen, defaultQuery, className, style, ...aria }: MultiSelectProps) {
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(!!defaultOpen);
  const [query, setQuery] = useState(defaultQuery ?? '');
  const shown = useMemo(() => filterItems(options, query), [options, query]);
  useEffect(() => (open && root.current ? onOutsidePointer(root.current, () => setOpen(false)) : undefined), [open]);
  const toggle = (t: string) => { onChange?.(multiToggle(value, t, single)); if (single) setOpen(false); };
  const onKeyDown = (e: KeyboardEvent) => {
    const r = multiKey(open, e.key);
    if (r) { e.preventDefault(); setOpen(r === 'open'); }
  };
  const textEl = <span className={multiTextClass(value)}>{multiText(value, noun)}</span>;
  if (inField) return <>{textEl}<span className="unit" aria-hidden="true"><Icon name="chevronDown" /></span></>;
  return (
    <div ref={root} className={cx(multiClass({ open, inlineMenu }), className)} style={styleOf(style)}>
      <div className="ms-t" role="combobox" tabIndex={0} aria-expanded={open} aria-controls={listId} aria-haspopup="listbox" aria-label={multiTriggerLabel(noun, aria['aria-label'])} onClick={() => setOpen((o) => !o)} onKeyDown={onKeyDown}>
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
            <u role="button" tabIndex={0} onClick={() => onChange?.([])} onKeyDown={(e) => { if (isActivateKey(e.key)) { e.preventDefault(); onChange?.([]); } }}>清除</u>
          </div>
        </div>
      )}
    </div>
  );
}
