import { useId, useMemo, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { searchBoxClass, suggestionClass, suggestionId, suggestionListLabel, tagMatches, tagSearchKey, type TagSuggestion } from '@case-center/core/search';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export type { TagSuggestion };

export interface TagSearchProps {
  /** 可建議的標籤 */
  tags: TagSuggestion[];
  value?: string;
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
export function TagSearch({ tags, value = '', onChange, onPick, label, placeholder = '搜尋公告標題或標籤', max, className, style }: TagSearchProps) {
  const inputId = useId();
  const listId = inputId + '-list';
  const [query, setQuery] = useState(value);
  const [focus, setFocus] = useState(false);
  const [closed, setClosed] = useState(false);
  const [cursor, setCursor] = useState(0);
  const shown = useMemo(() => tagMatches(tags, query, max), [tags, query, max]);
  const open = focus && !closed && shown.length > 0;
  const set = (v: string) => { setQuery(v); setClosed(false); setCursor(0); onChange?.(v); };
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
    <div className={cx('tsr', className)} style={styleOf(style)}>
      <div className={searchBoxClass(focus)}>
        <Icon name="search" />
        <input
          id={inputId}
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
    </div>
  );
}
