import { Component, ElementRef, Injector, afterNextRender, computed, inject, input, model, output } from '@angular/core';
import {
  dueTag, dueText, flipRows, isSortKey, measureRows, nextSort, rowClass, sortRows, tagClass, thLabel, thState, todayIso,
  type TableColumn, type TableSort, type ThState,
} from '@case-center/core/table';

export type { TableColumn, TableSort, ThState };
export type TableRow = Record<string, string | number | boolean | undefined> & { key?: string; closed?: boolean };

/**
 * 排序表頭：顯示升冪／降冪箭頭；表格裡是 columnheader，可聚焦，點擊或 Enter／Space 發出 sort。
 *   <span ccSortTh label="到期日" state="asc" (sort)="…"></span>
 */
@Component({
  selector: 'span[ccSortTh]',
  host: {
    class: 'th', role: 'columnheader', tabindex: '0',
    '[attr.data-s]': 'state()', '[attr.aria-sort]': 'aria()', '[attr.aria-label]': 'name()',
    '(click)': 'sort.emit()', '(keydown)': 'onKey($event)',
  },
  template: `{{ label() }}<svg viewBox="0 0 12 14" aria-hidden="true"><path class="up" d="M6 1l4 5H2z"/><path class="dn" d="M6 13l4-5H2z"/></svg>`,
})
export class SortTh {
  readonly label = input.required<string>();
  readonly state = input<ThState>('none');
  readonly sort = output<void>();
  protected readonly aria = computed(() => (this.state() === 'none' ? 'none' : this.state() === 'asc' ? 'ascending' : 'descending'));
  protected readonly name = computed(() => thLabel(this.label(), this.state()));
  protected onKey(e: KeyboardEvent) { if (isSortKey(e.key)) { e.preventDefault(); this.sort.emit(); } }
}

/**
 * 到期欄：逾期紅、今天與 3 天內琥珀；已結案只顯示日期。規則在 core/table.ts。
 *   <span ccDueCell due="2026-11-14"></span>（表格列裡加 [inRow]="true"）
 */
@Component({
  selector: 'span[ccDueCell]',
  host: { '[class]': "inRow() ? 'due' : 'due-r'", '[attr.role]': "inRow() ? 'cell' : null" },
  template: `{{ text() }}@if (tag(); as t) {<span [class]="cls(t)">{{ t.label }}</span>}`,
})
export class DueCell {
  /** 到期日：YYYY-MM-DD 或 MM-DD */
  readonly due = input.required<string>();
  /** 今天（預設系統日期）；比對與測試時固定 */
  readonly today = input<string>();
  /** 已結案：只顯示日期 */
  readonly closed = input(false);
  readonly inRow = input(false);
  protected readonly text = computed(() => dueText(this.due()));
  protected readonly tag = computed(() => dueTag(this.due(), this.today() ?? todayIso(), this.closed()));
  protected readonly cls = tagClass;
}

/**
 * 資料表格：點表頭排序，換順序時各列滑到新位置；到期欄自動標逾期與即將到期。
 *   <div ccDataTable label="案件列表" [columns]="cols" [rows]="cases" [(sort)]="sort"></div>
 */
@Component({
  selector: 'div[ccDataTable]',
  imports: [SortTh, DueCell],
  host: { class: 'tb', role: 'table', '[attr.aria-label]': 'label()' },
  template: `@if (header()) {<div [class]="rowCls(true)" role="row" [style.grid-template-columns]="cols()">@for (c of columns(); track c.key) {@if (c.sortable) {<span ccSortTh [label]="c.label" [state]="th(c.key)" (sort)="sortBy(c.key)"></span>} @else {<span role="columnheader" [class.nm]="c.cell === 'nm'">{{ c.label }}</span>}}</div>}@for (r of sorted(); track keyOf(r); let i = $index) {<div [class]="rowCls(false)" role="row" [attr.data-k]="keyOf(r)" [style.grid-template-columns]="cols()" [style.border-top]="!header() && i === 0 ? '0' : null">@for (c of columns(); track c.key) {@if (c.cell === 'due') {<span ccDueCell [due]="str(r[c.key])" [today]="today()" [closed]="!!r.closed" [inRow]="true"></span>} @else {<span [class]="c.cell ?? ''" role="cell">{{ r[c.key] }}</span>}}</div>}`,
})
export class DataTable {
  /** 表格名稱（讀屏用） */
  readonly label = input.required<string>();
  readonly columns = input.required<TableColumn[]>();
  readonly rows = input.required<TableRow[]>();
  /** 排序狀態（可雙向綁定）；沒給就由表格自己記 */
  readonly sort = model<TableSort>({ key: null, dir: 'asc' });
  /** 欄寬（grid-template-columns），預設照展示牆 */
  readonly cols = input<string>();
  /** 顯示表頭列 */
  readonly header = input(true);
  /** 到期欄的「今天」 */
  readonly today = input<string>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  protected readonly sorted = computed(() => sortRows(this.rows(), this.sort()));
  protected readonly rowCls = rowClass;
  protected keyOf(r: TableRow) { return String(r.key ?? r[this.columns()[0]?.key]); }
  protected th(key: string) { return thState(this.sort(), key); }
  protected str(v: unknown) { return String(v ?? ''); }
  protected sortBy(key: string) {
    const before = measureRows(this.el);
    this.sort.set(nextSort(this.sort(), key));
    afterNextRender(() => flipRows(this.el, before), { injector: this.injector });
  }
}
