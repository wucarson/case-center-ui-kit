import { Component, computed, input, model } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PAGE_ARROW, isPageKey, pageArrowOff, pageCount, pageItems, pageLabel, pageTarget } from '@case-center/core/pagination';
import { Icon } from './icon';

/**
 * 分頁：頁數多時頭尾固定、中間收成 …；第一頁停用「‹」、最後一頁停用「›」。
 *   <div ccPagination [total]="56" [(page)]="page" [(pageSize)]="size"></div>
 */
@Component({
  selector: '[ccPagination]',
  imports: [Icon, NgTemplateOutlet],
  host: { class: 'pg' },
  template: `@if (showSize()) {<span>每頁<span class="sel" style="position: relative">{{ pageSize() }}<svg ccIcon="chevronDown"></svg><select aria-label="每頁筆數" style="position: absolute; inset: 0; width: 100%; opacity: 0; cursor: pointer" (change)="pageSize.set(+$any($event.target).value)">@for (n of sizes(); track n) {<option [value]="n" [selected]="n === pageSize()">{{ n }}</option>}</select></span>{{ unit() }}，共 <b>{{ total() }}</b> {{ unit() }}</span>}<nav [attr.aria-label]="label()"><ng-template #arrow let-d><span role="button" [attr.tabindex]="off(d) ? -1 : 0" [attr.aria-label]="arrowInfo(d).label" [attr.aria-disabled]="off(d) || null" [class.dis]="off(d)" (click)="go(page() + d)" (keydown)="onKey($event, page() + d)">{{ arrowInfo(d).text }}</span></ng-template><ng-container *ngTemplateOutlet="arrow; context: { $implicit: -1 }" />@for (p of items(); track $index) {@if (p === null) {<span class="gap" aria-hidden="true">…</span>} @else {<span role="button" tabindex="0" [attr.aria-label]="pageLabel(p)" [attr.aria-current]="p === page() ? 'page' : null" [class.on]="p === page()" (click)="go(p)" (keydown)="onKey($event, p)">{{ p }}</span>}}<ng-container *ngTemplateOutlet="arrow; context: { $implicit: 1 }" /></nav>`,
})
export class Pagination {
  /** 總筆數 */
  readonly total = input.required<number>();
  /** 目前頁，從 1 開始 */
  readonly page = model.required<number>();
  readonly pageSize = model.required<number>();
  /** 每頁筆數的選項 */
  readonly sizes = input<number[]>([20, 50]);
  /** 單位，例：「人」 */
  readonly unit = input('筆');
  /** 頁碼區的讀屏名稱 */
  readonly label = input('分頁');
  /** 左邊「每頁 N 筆，共 M 筆」；空間不夠時關掉 */
  readonly showSize = input(true);

  protected arrowInfo(d: -1 | 1) { return PAGE_ARROW[d]; }
  protected readonly pageLabel = pageLabel;
  private readonly pages = computed(() => pageCount(this.total(), this.pageSize()));
  protected readonly items = computed(() => pageItems(this.page(), this.pages()));
  protected off(d: -1 | 1) { return pageArrowOff(d, this.page(), this.pages()); }
  protected go(p: number) { const t = pageTarget(p, this.page(), this.pages()); if (t !== null) this.page.set(t); }
  protected onKey(e: KeyboardEvent, p: number) { if (isPageKey(e.key)) { e.preventDefault(); this.go(p); } }
}
