import { Component, ElementRef, computed, effect, inject, input, model, output, signal, viewChild } from '@angular/core';
import { onOutsidePointer } from '@case-center/core/dom';
import {
  MENU_FLOAT_STYLE, focusFirstMenuItem, focusMenuItem, isMenuItemOff, menuItemClass, menuKey, menuSelect, menuTriggerClass,
  type MenuItem,
} from '@case-center/core/menu';
import { Icon } from './icon';

export type { MenuItem };

/**
 * 選單清單（.mn-p）。↑↓ 移動（停用項也停得到，才念得到原因）、Enter 選取、Esc 關閉。
 * 固定展開（說明頁、側欄內）：<div class="mn pin"><div ccMenuPanel [items]="items"></div></div>
 */
@Component({
  selector: '[ccMenuPanel]',
  imports: [Icon],
  host: { class: 'mn-p', role: 'menu', '(keydown)': 'onKey($event)' },
  template: `@for (it of items(); track $index) {@if (it.separator) {<div class="mn-sep" role="separator"></div>} @else {<div role="menuitem" tabindex="-1" [attr.aria-disabled]="isOff(it) || null" [class]="itemClass(it, $index)" (mouseenter)="cursor.set($index)" (mouseleave)="cursor.set(-1)" (click)="select(it)">@if (it.icon) {<svg [ccIcon]="it.icon"></svg>}{{ it.label }}@if (it.disabledReason) {<small>{{ it.disabledReason }}</small>}</div>}}`,
})
export class MenuPanel {
  readonly items = input.required<MenuItem[]>();
  /** 選取後或按 Esc */
  readonly close = output<void>();

  protected readonly cursor = signal(-1);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly isOff = isMenuItemOff;
  protected itemClass(it: MenuItem, i: number) { return menuItemClass(it, i === this.cursor()); }

  protected select(it: MenuItem) { if (menuSelect(it)) this.close.emit(); }

  protected onKey(e: KeyboardEvent) {
    const r = menuKey(this.items(), this.cursor(), e.key);
    if (!r) return;
    e.preventDefault();
    if (r.type === 'move') { this.cursor.set(r.index); focusMenuItem(this.host.nativeElement, this.items(), r.index); }
    else if (r.type === 'select') this.select(this.items()[r.index]);
    else this.close.emit();
  }
}

/**
 * 操作選單：⋯ 收起次要動作。觸發鈕＋浮起的清單（靠右對齊）。
 * 用法：<div ccMenu [items]="items" label="更多操作：現場設備異常排查"></div>
 */
@Component({
  selector: '[ccMenu]',
  imports: [Icon, MenuPanel],
  host: { class: 'mn-h', style: 'position: relative' },
  template: `<button #btn type="button" [class]="triggerClass()" [attr.aria-label]="label()" aria-haspopup="menu" [attr.aria-expanded]="open()" (click)="open.set(!open())"><svg ccIcon="dots"></svg></button>@if (open() && items().length > 0) {<div ccMenuPanel [items]="items()" [attr.aria-label]="label()" [style]="floatStyle" (close)="close()"></div>}`,
})
export class Menu {
  readonly items = input.required<MenuItem[]>();
  /** 觸發鈕的讀屏名稱，例：「更多操作：現場設備異常排查」 */
  readonly label = input.required<string>();
  readonly open = model(false);

  protected readonly floatStyle = MENU_FLOAT_STYLE;
  protected readonly triggerClass = computed(() => menuTriggerClass(this.open()));
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly btn = viewChild.required<ElementRef<HTMLButtonElement>>('btn');

  constructor() {
    // 打開時：點外面關閉、焦點落在第一個可用項目
    effect((onCleanup) => {
      if (!this.open()) return;
      const root = this.host.nativeElement;
      const off = onOutsidePointer(root, () => this.open.set(false));
      const raf = requestAnimationFrame(() => focusFirstMenuItem(root));
      onCleanup(() => { off(); cancelAnimationFrame(raf); });
    });
  }

  protected close() {
    this.open.set(false);
    this.btn().nativeElement.focus();
  }
}
