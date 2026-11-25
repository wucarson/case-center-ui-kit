import type { CSSProperties, KeyboardEvent } from 'react';
import { PAGE_ARROW, isPageKey, pageArrowOff, pageCount, pageItems, pageLabel, pageTarget } from '@case-center/core/pagination';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export interface PaginationProps {
  /** 總筆數 */
  total: number;
  /** 目前頁，從 1 開始 */
  page: number;
  pageSize: number;
  /** 每頁筆數的選項 */
  sizes?: number[];
  /** 單位，例：「人」 */
  unit?: string;
  /** 頁碼區的讀屏名稱 */
  label?: string;
  /** 左邊「每頁 N 筆，共 M 筆」；空間不夠時關掉 */
  showSize?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
  style?: string | CSSProperties;
}

/** 分頁：頁數多時頭尾固定、中間收成 …；第一頁停用「‹」、最後一頁停用「›」。規則在 core/pagination.ts。 */
export function Pagination({ total, page, pageSize, sizes = [20, 50], unit = '筆', label = '分頁', showSize = true, onPageChange, onPageSizeChange, className, style }: PaginationProps) {
  const pages = pageCount(total, pageSize);
  const go = (p: number) => { const t = pageTarget(p, page, pages); if (t !== null) onPageChange?.(t); };
  const key = (p: number) => (e: KeyboardEvent) => { if (isPageKey(e.key)) { e.preventDefault(); go(p); } };
  const arrow = (d: -1 | 1) => {
    const off = pageArrowOff(d, page, pages);
    return (
      <span role="button" tabIndex={off ? -1 : 0} aria-label={PAGE_ARROW[d].label} aria-disabled={off || undefined} className={off ? 'dis' : undefined} onClick={() => go(page + d)} onKeyDown={key(page + d)}>
        {PAGE_ARROW[d].text}
      </span>
    );
  };
  return (
    <div className={cx('pg', className)} style={styleOf(style)}>
      {showSize && (
        <span>
          每頁<span className="sel" style={{ position: 'relative' }}>{pageSize}<Icon name="chevronDown" />
            <select aria-label="每頁筆數" value={pageSize} onChange={(e) => onPageSizeChange?.(Number(e.target.value))} style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer' }}>
              {sizes.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </span>{`${unit}，共 `}<b>{total}</b>{` ${unit}`}
        </span>
      )}
      <nav aria-label={label}>
        {arrow(-1)}
        {pageItems(page, pages).map((p, i) =>
          p === null
            ? <span key={'g' + i} className="gap" aria-hidden="true">…</span>
            : <span key={p} role="button" tabIndex={0} aria-label={pageLabel(p)} aria-current={p === page ? 'page' : undefined} className={p === page ? 'on' : undefined} onClick={() => go(p)} onKeyDown={key(p)}>{p}</span>,
        )}
        {arrow(1)}
      </nav>
    </div>
  );
}
