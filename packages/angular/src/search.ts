import { Component, computed, input, model, output, signal } from '@angular/core';
import { searchBoxClass, suggestionClass, suggestionId, suggestionListLabel, tagMatches, tagSearchKey, type TagSuggestion } from '@wucarson/facet-core/search';
import { Icon } from './icon';

export type { TagSuggestion };

let seq = 0;

/**
 * 搜尋與標籤建議：邊打字邊列出相符的標籤；↑↓ 移動、Enter 選取、Esc 收起。
 *   <div ccTagSearch [tags]="tags" [(value)]="q" label="搜尋公告" (pick)="go($event)"></div>
 */
@Component({
  selector: '[ccTagSearch]',
  imports: [Icon],
  host: { class: 'tsr' },
  template: `<div [class]="boxCls()"><svg ccIcon="search"></svg><input [id]="inputId" class="ff-real" role="combobox" [attr.aria-label]="label()" [attr.aria-expanded]="open()" [attr.aria-controls]="listId" aria-autocomplete="list" [attr.aria-activedescendant]="open() ? optId(cursor()) : null" autocomplete="off" [attr.placeholder]="placeholder()" [value]="value()" (input)="set($any($event.target).value)" (focus)="focus.set(true)" (blur)="focus.set(false)" (keydown)="onKey($event)" /></div>@if (open()) {<div [id]="listId" class="results show" role="listbox" [attr.aria-label]="listLabel()">@for (t of shown(); track t.label; let i = $index) {<div [id]="optId(i)" [class]="optCls(i)" role="option" [attr.aria-selected]="i === cursor()" (mousedown)="$event.preventDefault(); choose(t)" (mousemove)="cursor.set(i)"><span>{{ t.label }}</span>@if (t.count) {<em>{{ t.count }}</em>}</div>}</div>}`,
})
export class TagSearch {
  /** 可建議的標籤 */
  readonly tags = input.required<TagSuggestion[]>();
  readonly value = model('');
  /** 讀屏名稱，例：「搜尋公告」 */
  readonly label = input.required<string>();
  readonly placeholder = input('搜尋公告標題或標籤');
  /** 最多幾個建議（預設 5） */
  readonly max = input(5);
  readonly pick = output<TagSuggestion>();

  protected readonly inputId = `cc-ts-${++seq}`;
  protected readonly listId = this.inputId + '-list';
  protected readonly focus = signal(false);
  private readonly closed = signal(false);
  protected readonly cursor = signal(0);
  protected readonly shown = computed(() => tagMatches(this.tags(), this.value(), this.max()));
  protected readonly open = computed(() => this.focus() && !this.closed() && this.shown().length > 0);
  protected readonly boxCls = computed(() => searchBoxClass(this.focus()));
  protected readonly listLabel = computed(() => suggestionListLabel(this.label()));
  protected optId(i: number) { return suggestionId(this.inputId, i); }
  protected optCls(i: number) { return suggestionClass(i === this.cursor()); }

  protected set(v: string) { this.value.set(v); this.closed.set(false); this.cursor.set(0); }
  protected choose(t: TagSuggestion) { this.set(t.label); this.closed.set(true); this.pick.emit(t); }
  protected onKey(e: KeyboardEvent) {
    const r = tagSearchKey(this.open(), this.cursor(), this.shown().length, e.key);
    if (!r) return;
    e.preventDefault();
    if (r.type === 'move') this.cursor.set(r.index);
    else if (r.type === 'pick') this.choose(this.shown()[r.index]);
    else this.closed.set(true);
  }
}
