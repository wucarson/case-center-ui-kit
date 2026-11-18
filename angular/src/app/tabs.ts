import { Component, ElementRef, inject, input, model } from '@angular/core';
import { focusNth } from '../../../core/choice';
import { detailTabAriaLabel, detailTabClass, detailTabSeparator, tabClass, tabsKey } from '../../../core/tabs';
import type { FillIconName } from '../../../shared/icons';
import { Icon } from './icon';

export interface TabItem {
  key: string;
  label: string;
  /** 數量：有意義才給（「全部」通常不給） */
  count?: number;
}

/**
 * 頁籤：同一頁內切換平行內容，可帶數量。左右鍵切換、Home／End 跳頭尾。
 *   <div ccTabs [tabs]="tabs" [(value)]="filter" aria-label="篩選"></div>
 */
@Component({
  selector: '[ccTabs]',
  host: { class: 'tabs', role: 'tablist' },
  template: `@for (t of tabs(); track t.key) {@let on = t.key === value();<span [class]="tabCls(on)" role="tab" [attr.aria-selected]="on" [attr.tabindex]="on ? 0 : -1" (click)="value.set(t.key)" (keydown)="onKey($event, $index)">{{ t.label }}@if (t.count != null) {<b>{{ t.count }}</b>}</span>}`,
})
export class Tabs {
  readonly tabs = input.required<TabItem[]>();
  /** 選中的 key */
  readonly value = model.required<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly tabCls = tabClass;
  protected onKey(e: KeyboardEvent, i: number) {
    const j = tabsKey(e.key, i, this.tabs().length);
    if (j < 0) return;
    e.preventDefault();
    this.value.set(this.tabs()[j].key);
    focusNth(this.host.nativeElement, '[role="tab"]', j);
  }
}

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

/**
 * 詳情頁籤：圖示＋名稱＋數量，選中時淡主色底、圖示填滿。左右鍵切換、Home／End 跳頭尾。
 *   <div ccDetailTabs [tabs]="tabs" [(value)]="section" label="專案內容"></div>
 */
@Component({
  selector: '[ccDetailTabs]',
  imports: [Icon],
  host: { class: 'dt', role: 'tablist', '[attr.aria-label]': 'label() ?? null' },
  template: `@for (t of tabs(); track t.key) {@if (sep($index, t.key)) {<i class="sep" aria-hidden="true"></i>}@let on = t.key === value();<span [class]="tabCls(on)" role="tab" [attr.aria-selected]="on" [attr.aria-label]="ariaLabel(t)" [attr.tabindex]="on ? 0 : -1" (click)="value.set(t.key)" (keydown)="onKey($event, $index)"><svg [ccIcon]="t.icon" class="ln"></svg><svg [ccIcon]="t.icon" [fill]="true"></svg>{{ t.label }}@if (t.count != null) {<b>{{ t.count }}</b>}</span>}`,
})
export class DetailTabs {
  readonly tabs = input.required<DetailTabItem[]>();
  readonly value = model.required<string>();
  /** 從這幾個 key 開始新的一組，前面畫分隔線 */
  readonly groupStarts = input<string[]>([]);
  /** 讀屏名稱，例：「專案內容」 */
  readonly label = input<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly tabCls = detailTabClass;
  protected readonly ariaLabel = detailTabAriaLabel;
  protected sep(i: number, key: string) { return detailTabSeparator(i, key, this.groupStarts()); }
  protected onKey(e: KeyboardEvent, i: number) {
    const j = tabsKey(e.key, i, this.tabs().length);
    if (j < 0) return;
    e.preventDefault();
    this.value.set(this.tabs()[j].key);
    focusNth(this.host.nativeElement, '[role="tab"]', j);
  }
}
