import { Fragment, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import type { FillIconName } from '../../../shared/icons';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export interface DetailTabItem {
  key: string;
  label: string;
  /** 線條＋填滿兩版都有的圖示（選中時換填滿） */
  icon: FillIconName;
  /** 數量；null／省略就不顯示 */
  count?: number | null;
  /** 數量的意思不明顯時給讀屏念的說法，例：「3 件未結」 */
  srCount?: string;
}

export interface DetailTabsProps {
  tabs: DetailTabItem[];
  value: string;
  onChange?: (key: string) => void;
  /** 從這幾個 key 開始新的一組，前面畫分隔線 */
  groupStarts?: string[];
  /** 讀屏名稱，例：「專案內容」 */
  label?: string;
  className?: string;
  style?: string | CSSProperties;
}

/** 詳情頁籤：圖示＋名稱＋數量，選中時淡主色底、圖示填滿。左右鍵切換、Home／End 跳頭尾。 */
export function DetailTabs({ tabs, value, onChange, groupStarts = [], label, className, style }: DetailTabsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const n = tabs.length;
    const j = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
    if (j < 0) return;
    e.preventDefault();
    onChange?.(tabs[j].key);
    ref.current?.querySelectorAll<HTMLElement>('[role="tab"]')[j]?.focus();
  };
  return (
    <div ref={ref} className={cx('dt', className)} style={styleOf(style)} role="tablist" aria-label={label}>
      {tabs.map((t, i) => {
        const on = t.key === value;
        return (
          <Fragment key={t.key}>
            {i > 0 && groupStarts.includes(t.key) && <i className="sep" aria-hidden="true" />}
            <span
              className={cx('dtab', on && 'on')}
              role="tab"
              aria-selected={on}
              aria-label={t.srCount ? `${t.label}，${t.srCount}` : undefined}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange?.(t.key)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <Icon name={t.icon} className="ln" /><Icon name={t.icon} fill />{t.label}{t.count != null && <b>{t.count}</b>}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}
