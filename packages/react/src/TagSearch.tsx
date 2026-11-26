import { forwardRef, useEffect, useId, useMemo, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { searchBoxClass, suggestionClass, suggestionId, suggestionListLabel, tagMatches, tagSearchKey, type TagSuggestion } from '@wucarson/facet-core/search';
import { FormValue, leaveHandler, useControlled, useFieldRef, type FieldProps } from './form';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export type { TagSuggestion };

export interface TagSearchProps extends FieldProps {
  /** 可建議的標籤 */
  tags: TagSuggestion[];
  /** 受控：輸入的文字 */
  value?: string;
  /** 非受控：初始值 */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 選了某個建議 */
  onPick?: (tag: TagSuggestion) => void;
  /** 讀屏名稱，例：「搜尋公告」 */
  label: string;
  placeholder?: string;
  /** 最多幾個建議（預設 5） */
  max?: number;
  className?: string;
  style?: string | CSSProperties;
}

/** 搜尋與標籤建議：邊打字邊列出相符的標籤；↑↓ 移動、Enter 選取、Esc 收起。規則在 core/search.ts。 */
/** 表單：值是輸入的文字。disabled＝輸入框停用（展示牆尚無停用樣式）。ref 指向輸入框 */
export const TagSearch = forwardRef<HTMLInputElement, TagSearchProps>(function TagSearch({ tags, value: v, defaultValue, onChange, onPick, label, placeholder = '搜尋公告標題或標籤', max, disabled, name, onBlur, className, style }, ref) {
  const [value, setVal] = useControlled(v, defaultValue, onChange, '');
  const inputId = useId();
  const listId = inputId + '-list';
  const [query, setQuery] = useState(value);
  useEffect(() => { setQuery(value); }, [value]);   // 值從外面改了（表單寫入、重設）
  const [focus, setFocus] = useState(false);
  const [closed, setClosed] = useState(false);
  const [cursor, setCursor] = useState(0);
  const shown = useMemo(() => tagMatches(tags, query, max), [tags, query, max]);
  const open = focus && !closed && shown.length > 0;
  const set = (t: string) => { setQuery(t); setClosed(false); setCursor(0); setVal(t); };
  const pick = (t: TagSuggestion) => { set(t.label); setClosed(true); onPick?.(t); };
  const onKeyDown = (e: KeyboardEvent) => {
    const r = tagSearchKey(open, cursor, shown.length, e.key);
    if (!r) return;
    e.preventDefault();
    if (r.type === 'move') setCursor(r.index);
    else if (r.type === 'pick') pick(shown[r.index]);
    else setClosed(true);
  };
  return (
    <div className={cx('tsr', disabled && 'dis', className)} style={styleOf(style)} onBlur={leaveHandler(onBlur)}>
      <div className={searchBoxClass(focus)}>
        <Icon name="search" />
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className="ff-real"
          role="combobox"
          aria-label={label}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open ? suggestionId(inputId, cursor) : undefined}
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(e) => set(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onKeyDown={onKeyDown}
        />
      </div>
      {open && (
        <div className="results show" id={listId} role="listbox" aria-label={suggestionListLabel(label)}>
          {shown.map((t, i) => (
            <div key={t.label} id={suggestionId(inputId, i)} className={suggestionClass(i === cursor)} role="option" aria-selected={i === cursor} onMouseDown={(e) => { e.preventDefault(); pick(t); }} onMouseMove={() => setCursor(i)}>
              <span>{t.label}</span>{t.count && <em>{t.count}</em>}
            </div>
          ))}
        </div>
      )}
      <FormValue name={name} value={value} disabled={disabled} />
    </div>
  );
});
