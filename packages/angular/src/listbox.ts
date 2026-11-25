import { Component, ElementRef, computed, effect, inject, input, model, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { isActivateKey, onOutsidePointer } from '@case-center/core/dom';
import {
  COMBO_EMPTY, comboClass, comboIcon, comboKey, comboListId, comboOptionClass, comboOptionId, filterItems, multiClass, multiFooter, multiKey,
  multiSearchLabel, multiShowCount, multiText, multiTextClass, multiToggle, multiTriggerLabel,
} from '@case-center/core/listbox';
import { Checkbox } from './choice';
import { FIELD_BOX, FormField } from './field';
import { Icon } from './icon';

let seq = 0;

/**
 * 下拉選單：從固定清單選一個值；打字可篩選。↑↓ 移動、Enter 選取、Esc 關閉。
 *   <div ccCombo [items]="types" [(value)]="type" label="工作類型" selfLabelled></div>
 * 放進 <div ccFormField> 時自己變成輸入框區（.ff-i），外框由欄位畫。
 */
@Component({
  selector: '[ccCombo]',
  imports: [Icon, NgTemplateOutlet],
  providers: [{ provide: FIELD_BOX, useExisting: Combo }],
  host: { '[class]': 'cls()' },
  template: `<ng-template #inp><input [id]="inputId()" role="combobox" [attr.aria-expanded]="open()" [attr.aria-controls]="listId()" [attr.aria-activedescendant]="active()" aria-autocomplete="list" [attr.aria-invalid]="invalid() || null" [attr.aria-label]="selfLabelled() ? label() : null" autocomplete="off" [attr.placeholder]="placeholder() ?? null" [value]="query() ?? value()" (input)="onInput($event)" (focus)="open.set(true)" (keydown)="onKey($event)" /></ng-template><ng-template #menu>@if (open()) {<div class="dd-m" [id]="listId()" role="listbox" [attr.aria-label]="label()">@for (t of shown(); track t; let i = $index) {<div [id]="optId(i)" role="option" [attr.aria-selected]="t === value()" [attr.class]="optCls(t, i)" (mousedown)="$event.preventDefault(); pick(t)" (mousemove)="cursor.set(i)">{{ t }}<svg ccIcon="check"></svg></div>} @empty {<div class="none">{{ empty }}</div>}</div>}</ng-template>@if (inField()) {<ng-container *ngTemplateOutlet="inp" /><span class="unit" aria-hidden="true"><svg ccIcon="chevronDown"></svg></span><ng-container *ngTemplateOutlet="menu" />} @else {<div class="dd-t"><ng-container *ngTemplateOutlet="inp" /><svg [ccIcon]="icon()"></svg></div><ng-container *ngTemplateOutlet="menu" />}`,
})
export class Combo {
  readonly items = input.required<string[]>();
  readonly value = model('');
  readonly placeholder = input<string>();
  /** 欄位名稱：給清單與展開鈕念 */
  readonly label = input.required<string>();
  /** 沒有外部 <label> 時打開，用 label 命名輸入框 */
  readonly selfLabelled = input(false);
  readonly invalid = input(false);
  /** 清單跟在欄位下方、不浮起（放在對話框、面板裡） */
  readonly inlineMenu = input(false);
  readonly open = model(false);
  /** 一開始的輸入字（篩選） */
  readonly defaultQuery = input<string>();
  readonly id = input<string>();

  private readonly field = inject(FormField, { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly auto = `cc-combo-${++seq}`;
  protected readonly inField = computed(() => !!this.field);
  protected readonly query = signal<string | null>(null);
  protected readonly cursor = signal(-1);
  protected readonly empty = COMBO_EMPTY;
  protected readonly inputId = computed(() => this.id() ?? this.auto);
  protected readonly listId = computed(() => comboListId(this.inputId()));
  protected readonly shown = computed(() => filterItems(this.items(), this.query()));
  protected readonly icon = computed(() => comboIcon(this.open()));
  protected readonly active = computed(() => (this.open() && this.cursor() >= 0 ? comboOptionId(this.inputId(), this.cursor()) : null));
  protected readonly cls = computed(() => (this.inField() ? 'ff-i' : comboClass({ open: this.open(), inlineMenu: this.inlineMenu(), invalid: this.invalid() })));
  protected optId(i: number) { return comboOptionId(this.inputId(), i); }
  protected optCls(t: string, i: number) { return comboOptionClass(t === this.value(), i === this.cursor()) || null; }

  constructor() {
    effect((onCleanup) => { if (this.open() && !this.inField()) onCleanup(onOutsidePointer(this.host.nativeElement, () => this.close())); });
  }

  // 一開始有輸入字：游標停在第一個符合的項目
  ngOnInit() { const q = this.defaultQuery(); if (q) { this.query.set(q); this.cursor.set(0); } }

  protected close() { this.open.set(false); this.query.set(null); this.cursor.set(-1); }
  protected pick(t: string) { this.value.set(t); this.close(); }
  protected onInput(e: Event) { this.query.set((e.target as HTMLInputElement).value); this.open.set(true); this.cursor.set(0); }
  protected onKey(e: KeyboardEvent) {
    const r = comboKey(this.open(), this.cursor(), this.shown().length, e.key);
    if (!r) return;
    e.preventDefault();
    if (r.type === 'open') this.open.set(true);
    else if (r.type === 'move') this.cursor.set(r.index);
    else if (r.type === 'pick') this.pick(this.shown()[r.index]);
    else this.close();
  }
}

/**
 * 多選下拉：從清單勾選多個；沒選＝全部。按鈕列出已選名稱和數量。
 *   <div ccMultiSelect [options]="depts" [(value)]="picked" noun="部門"></div>
 * 放進 <div ccFormField> 時只顯示文字與箭頭（自己變成輸入框區），外框由欄位畫。
 */
@Component({
  selector: '[ccMultiSelect]',
  imports: [Checkbox, Icon],
  providers: [{ provide: FIELD_BOX, useExisting: MultiSelect }],
  host: { '[class]': 'cls()' },
  template: `@if (inField()) {<span [attr.class]="textCls()">{{ text() }}</span><span class="unit" aria-hidden="true"><svg ccIcon="chevronDown"></svg></span>} @else {<div class="ms-t" role="combobox" tabindex="0" [attr.aria-expanded]="open()" [attr.aria-controls]="listId" aria-haspopup="listbox" [attr.aria-label]="triggerLabel()" (click)="open.set(!open())" (keydown)="onKey($event)"><span [attr.class]="textCls()">{{ text() }}</span>@if (showCount()) {<span class="ms-n">{{ value().length }}</span>}<svg ccIcon="chevronDown"></svg></div>@if (open()) {<div class="ms-p" [id]="listId" role="listbox" [attr.aria-multiselectable]="!single()"><div class="ms-s"><svg ccIcon="search"></svg><input [attr.aria-label]="searchLabel()" [attr.placeholder]="searchLabel()" [value]="query()" (input)="query.set($any($event.target).value)" (keydown)="onKey($event)" /></div><div class="ms-l">@for (t of shown(); track t) {<div ccCheckbox [label]="t" [checked]="value().includes(t)" (checkedChange)="toggle(t)"></div>}</div><div class="ms-f"><span>{{ footer() }}</span><u role="button" tabindex="0" (click)="clear()" (keydown)="onClearKey($event)">清除</u></div></div>}}`,
})
export class MultiSelect {
  readonly options = input.required<string[]>();
  /** 已選；空陣列＝全部 */
  readonly value = model.required<string[]>();
  /** 「部門」「客戶」：按鈕字、搜尋提示、底部說明都用它 */
  readonly noun = input.required<string>();
  /** 量詞：部門用「個」 */
  readonly unit = input('個');
  /** 單選：選一個就生效並關閉 */
  readonly single = input(false);
  /** 清單跟在按鈕下方、不浮起 */
  readonly inlineMenu = input(false);
  readonly open = model(false);
  readonly defaultQuery = input<string>();
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });

  private readonly field = inject(FormField, { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly listId = `cc-ms-${++seq}`;
  protected readonly inField = computed(() => !!this.field);
  protected readonly query = signal('');
  protected readonly shown = computed(() => filterItems(this.options(), this.query()));
  protected readonly text = computed(() => multiText(this.value(), this.noun()));
  protected readonly textCls = computed(() => multiTextClass(this.value()));
  protected readonly showCount = computed(() => multiShowCount(this.value(), this.single()));
  protected readonly triggerLabel = computed(() => multiTriggerLabel(this.noun(), this.ariaLabel()));
  protected readonly searchLabel = computed(() => multiSearchLabel(this.noun()));
  protected readonly footer = computed(() => multiFooter(this.value(), this.noun(), this.unit()));
  protected readonly cls = computed(() => (this.inField() ? 'ff-i' : multiClass({ open: this.open(), inlineMenu: this.inlineMenu() })));

  constructor() {
    effect((onCleanup) => { if (this.open() && !this.inField()) onCleanup(onOutsidePointer(this.host.nativeElement, () => this.open.set(false))); });
  }

  ngOnInit() { const q = this.defaultQuery(); if (q) this.query.set(q); }

  protected toggle(t: string) { this.value.set(multiToggle(this.value(), t, this.single())); if (this.single()) this.open.set(false); }
  protected clear() { this.value.set([]); }
  protected onKey(e: KeyboardEvent) { const r = multiKey(this.open(), e.key); if (r) { e.preventDefault(); this.open.set(r === 'open'); } }
  protected onClearKey(e: KeyboardEvent) { if (isActivateKey(e.key)) { e.preventDefault(); this.clear(); } }
}
