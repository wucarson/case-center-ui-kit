import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import {
  dueTag, dueText, flipRows, isSortKey, measureRows, nextSort, rowClass, sortRows, tagClass, thAriaSort, thLabel, thState, todayIso,
  type TableColumn, type TableSort, type ThState,
} from '@wucarson/facet-core/table';
import { cx, styleOf } from './util';

export type { TableColumn, TableSort, ThState };

const SortIcon = () => (
  <svg viewBox="0 0 12 14" aria-hidden="true"><path className="up" d="M6 1l4 5H2z" /><path className="dn" d="M6 13l4-5H2z" /></svg>
);

export interface SortThProps {
  label: string;
  state: ThState;
  /** 點擊或 Enter／Space：交給表格切換排序 */
  onSort?: () => void;
}

/** 排序表頭：顯示升冪／降冪箭頭；表格裡是 columnheader，可聚焦。 */
export function SortTh({ label, state, onSort }: SortThProps) {
  const key = (e: KeyboardEvent) => { if (isSortKey(e.key)) { e.preventDefault(); onSort?.(); } };
  return (
    <span
      className="th" data-s={state} role="columnheader" tabIndex={0}
      aria-sort={state === 'none' ? 'none' : state === 'asc' ? 'ascending' : 'descending'} aria-label={thLabel(label, state)}
      onClick={onSort} onKeyDown={key}
    >{label}<SortIcon /></span>
  );
}

export interface DueCellProps {
  /** 到期日：YYYY-MM-DD 或 MM-DD */
  due: string;
  /** 今天（預設系統日期）；比對與測試時固定 */
  today?: string;
  /** 已結案：只顯示日期 */
  closed?: boolean;
  /** 在表格列裡（class due、role cell）；預設單獨使用（class due-r） */
  inRow?: boolean;
}

/** 到期欄：逾期紅、今天與 3 天內琥珀；已結案只顯示日期。規則在 core/table.ts。 */
export function DueCell({ due, today, closed, inRow }: DueCellProps) {
  const t = dueTag(due, today ?? todayIso(), closed);
  return (
    <span className={inRow ? 'due' : 'due-r'} role={inRow ? 'cell' : undefined}>
      {dueText(due)}{t && <span className={tagClass(t)}>{t.label}</span>}
    </span>
  );
}

export type TableRow = Record<string, string | number | boolean | undefined> & { key?: string; closed?: boolean };

export interface DataTableProps {
  /** 表格名稱（讀屏用） */
  label: string;
  columns: TableColumn[];
  rows: TableRow[];
  /** 排序狀態；沒給就由表格自己記 */
  sort?: TableSort;
  onSortChange?: (sort: TableSort) => void;
  /** 欄寬（grid-template-columns），預設照展示牆 */
  cols?: string;
  /** 顯示表頭列（預設 true） */
  header?: boolean;
  /** 到期欄的「今天」 */
  today?: string;
  className?: string;
  style?: string | CSSProperties;
}

/** 資料表格：點表頭排序，換順序時各列滑到新位置；到期欄自動標逾期與即將到期。 */
export function DataTable({ label, columns, rows, sort: sortProp, onSortChange, cols, header = true, today, className, style }: DataTableProps) {
  const [own, setOwn] = useState<TableSort>({ key: null, dir: 'asc' });
  const sort = sortProp ?? own;
  const root = useRef<HTMLDivElement>(null);
  const before = useRef<Map<string, DOMRect>>(new Map());
  const keyOf = (r: TableRow) => String(r.key ?? r[columns[0]?.key]);
  const sorted = sortRows(rows, sort);
  const order = sorted.map(keyOf).join('|');
  useLayoutEffect(() => { flipRows(root.current, before.current); before.current = new Map(); }, [order]);
  const sortBy = (key: string) => {
    before.current = measureRows(root.current);
    const next = nextSort(sort, key);
    if (!sortProp) setOwn(next);
    onSortChange?.(next);
  };
  const grid = cols ? { gridTemplateColumns: cols } : undefined;
  return (
    <div ref={root} className={cx('tb', className)} role="table" aria-label={label} style={styleOf(style)}>
      {header && (
        <div className={rowClass(true)} role="row" style={grid}>
          {columns.map((c) => c.sortable
            ? <SortTh key={c.key} label={c.label} state={thState(sort, c.key)} onSort={() => sortBy(c.key)} />
            : <span key={c.key} role="columnheader" className={c.cell === 'nm' ? 'nm' : undefined}>{c.label}</span>)}
        </div>
      )}
      {sorted.map((r, i) => (
        <div key={keyOf(r)} data-k={keyOf(r)} className={rowClass()} role="row" style={!header && i === 0 ? { ...grid, borderTop: 0 } : grid}>
          {columns.map((c) => c.cell === 'due'
            ? <DueCell key={c.key} due={String(r[c.key] ?? '')} today={today} closed={!!r.closed} inRow />
            : <span key={c.key} className={c.cell} role="cell">{r[c.key] as string}</span>)}
        </div>
      ))}
    </div>
  );
}
/** aria-sort 給自訂表頭用 */
export { thAriaSort };
