import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { focusNth } from '../../../core/choice';
import { tabClass, tabsKey } from '../../../core/tabs';
import { cx, styleOf } from './util';

export interface TabItem {
  key: string;
  label: string;
  /** 數量：有意義才給（「全部」通常不給） */
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  /** 選中的 key */
  value: string;
  onChange?: (key: string) => void;
  'aria-label'?: string;
  className?: string;
  style?: string | CSSProperties;
}

/** 頁籤：同一頁內切換平行內容，可帶數量。左右鍵切換、Home／End 跳頭尾。規則在 core/tabs.ts。 */
export function Tabs({ tabs, value, onChange, className, style, ...aria }: TabsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const j = tabsKey(e.key, i, tabs.length);
    if (j < 0) return;
    e.preventDefault();
    onChange?.(tabs[j].key);
    if (ref.current) focusNth(ref.current, '[role="tab"]', j);
  };
  return (
    <div ref={ref} className={cx('tabs', className)} style={styleOf(style)} role="tablist" aria-label={aria['aria-label']}>
      {tabs.map((t, i) => {
        const on = t.key === value;
        return (
          <span key={t.key} className={tabClass(on)} role="tab" aria-selected={on} tabIndex={on ? 0 : -1} onClick={() => onChange?.(t.key)} onKeyDown={(e) => onKeyDown(e, i)}>
            {t.label}{t.count != null && <b>{t.count}</b>}
          </span>
        );
      })}
    </div>
  );
}
