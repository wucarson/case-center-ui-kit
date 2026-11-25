import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { focusNth } from '@case-center/core/choice';
import { chipExit, chipFocusAfter, chipRemoveLabel, chipsLabel, withoutAt } from '@case-center/core/chips';
import { isActivateKey } from '@case-center/core/dom';
import { cx, styleOf } from './util';

export interface FilterChipsProps {
  /** 目前套用的條件 */
  items: string[];
  /** 移除後剩下的條件 */
  onChange?: (items: string[]) => void;
  'aria-label'?: string;
  className?: string;
  style?: string | CSSProperties;
}

const X = '<path d="M6 6l12 12M18 6L6 18"/>';

/** 篩選標籤：目前套用的篩選條件，可逐一移除（縮小淡出，焦點移到下一個）。規則在 core/chips.ts。 */
export function FilterChips({ items, onChange, className, style, ...aria }: FilterChipsProps) {
  const box = useRef<HTMLDivElement>(null);
  const remove = async (i: number, keyboard: boolean) => {
    await chipExit(box.current?.children[i]);
    onChange?.(withoutAt(items, i));
    const f = chipFocusAfter(i, items.length);
    if (keyboard && f >= 0) requestAnimationFrame(() => box.current && focusNth(box.current, '.chip u', f));
  };
  return (
    <div ref={box} className={cx('chips', className)} role="list" aria-label={aria['aria-label'] ?? chipsLabel} style={styleOf(style)}>
      {items.map((t, i) => (
        <span key={t} className="chip" role="listitem">
          {t}
          <u role="button" tabIndex={0} aria-label={chipRemoveLabel(t)} onClick={() => remove(i, false)} onKeyDown={(e: KeyboardEvent) => { if (isActivateKey(e.key)) { e.preventDefault(); remove(i, true); } }}>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: X }} />
          </u>
        </span>
      ))}
    </div>
  );
}
