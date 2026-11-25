import { Component, ElementRef, computed, effect, inject, input, model, signal, untracked } from '@angular/core';
import { cx } from '@case-center/core/dom';
import {
  SORT_STEP, sortAnnounce, sortClampY, sortHandleLabel, sortHeight, sortKey, sortLand, sortMin, sortMove, sortRowClass, sortSlot, sortToggle, sortY,
  type SortItem,
} from '@case-center/core/sort';
import { Icon, SvgPath } from './icon';

export type { SortItem };

const GRIP = '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>';

/**
 * 拖移排序：拖握把調整順序，其他列滑開讓位，原位留虛線空位；握把聚焦後 ↑↓ 移動。
 *   <div ccDragSort [(items)]="columns" aria-label="欄位顯示順序"></div>
 */
@Component({
  selector: '[ccDragSort]',
  imports: [Icon, SvgPath],
  host: { class: 'drg', role: 'list', '[style.height]': 'height()' },
  template: `<i [class]="phCls()" [style.transform]="phY()"></i>@for (it of items(); track it.key) {@let i = index(it.key);<div [attr.data-key]="it.key" [class]="rowCls(it)" role="listitem" [style.transform]="rowY(it)">@if (it.locked) {<span class="drg-h lk" title="固定欄位"><svg ccIcon="lock"></svg></span>} @else {<button class="drg-h" type="button" [attr.aria-label]="handleLabel(it.label, i)" (pointerdown)="onDown($event, it.key)" (keydown)="onKey($event, it)"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true" [ccPath]="grip"></svg></button>}<span class="drg-n">{{ it.label }}</span><button class="drg-s" type="button" role="switch" [attr.aria-checked]="!!rowOf(it).visible" [attr.aria-label]="'顯示' + it.label" [disabled]="!!it.locked" (click)="commit(toggle(order(), it.key))"><span class="tg"><i></i></span></button></div>}<span role="status" [style]="sr">{{ say() }}</span>`,
})
export class DragSort {
  /** 目前順序；開頭的 locked 列固定不動 */
  readonly items = model.required<SortItem[]>();

  protected readonly grip = GRIP;
  protected readonly sr = { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  /** 拖移中用自己的順序；放下才寫回 items */
  protected readonly order = signal<SortItem[]>([]);
  private readonly held = signal<{ key: string; y: number } | null>(null);
  protected readonly say = signal('');
  private readonly n = computed(() => this.order().length);
  private readonly min = computed(() => sortMin(this.order()));
  protected readonly height = computed(() => sortHeight(this.items().length));
  protected readonly phCls = computed(() => cx('drg-ph', !!this.held() && 'show'));
  protected readonly phY = computed(() => { const h = this.held(); return h ? sortY(this.index(h.key)) : null; });
  protected readonly toggle = sortToggle;

  constructor() {
    effect(() => { const v = this.items(); if (!untracked(this.held)) this.order.set(v); });
  }

  protected index(key: string) { return this.order().findIndex((x) => x.key === key); }
  protected rowOf(it: SortItem) { return this.order()[this.index(it.key)] ?? it; }
  protected rowCls(it: SortItem) { return sortRowClass(this.rowOf(it), this.held()?.key === it.key); }
  protected rowY(it: SortItem) { const h = this.held(); return sortY(this.index(it.key), h?.key === it.key ? h.y : undefined); }
  protected handleLabel(label: string, i: number) { return sortHandleLabel(label, i, this.n()); }
  private land(key: string) { requestAnimationFrame(() => sortLand(this.host.nativeElement.querySelector(`[data-key="${CSS.escape(key)}"]`))); }
  protected commit(next: SortItem[]) { this.order.set(next); this.items.set(next); }

  protected onDown(e: PointerEvent, key: string) {
    if (e.button !== 0) return;
    const h = e.currentTarget as HTMLElement;
    h.setPointerCapture(e.pointerId);
    const y0 = e.clientY, base = this.index(key) * SORT_STEP, start = this.order();
    this.held.set({ key, y: base });
    const move = (ev: PointerEvent) => {
      const y = sortClampY(base + ev.clientY - y0, this.min(), this.n()), from = this.index(key), to = sortSlot(y, this.min(), this.n());
      if (to !== from) this.order.set(sortMove(this.order(), from, to));
      this.held.set({ key, y });
    };
    const up = () => {
      h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up);
      this.held.set(null); this.land(key);
      if (this.order() !== start) { this.items.set(this.order()); const i = this.index(key); this.say.set(sortAnnounce(this.order()[i].label, i, this.n())); }
    };
    h.addEventListener('pointermove', move); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
  }
  protected onKey(e: KeyboardEvent, it: SortItem) {
    const i = this.index(it.key), to = sortKey(i, this.min(), this.n(), e.key);
    if (to === null) return;
    e.preventDefault();
    if (to === i) return;
    this.commit(sortMove(this.order(), i, to)); this.land(it.key); this.say.set(sortAnnounce(it.label, to, this.n()));
  }
}
