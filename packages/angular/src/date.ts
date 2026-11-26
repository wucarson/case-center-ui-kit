import { Component, ElementRef, afterRenderEffect, computed, effect, inject, input, model, signal, viewChild } from '@angular/core';
import {
  MONTH_NEXT, MONTH_PREV, canPickDay, dateFieldLabel, dateGridKey, dayClass, isDateOpenKey, monthTitle, periodIndex, periodKey, periodText,
  placeDaySel, placePeriodPill, shiftView, viewOf, type MonthView,
} from '@wucarson/facet-core/date';
import { focusNth } from '@wucarson/facet-core/choice';
import { cx, onOutsidePointer } from '@wucarson/facet-core/dom';
import { PERIODS, PRESETS, WEEK, fmtDay, fromISO, monthCells, todayISO, type PeriodKey } from '@wucarson/facet-core/dates';
import { FormBridge } from './form';
import { Icon, SvgPath } from './icon';

/**
 * 日期選擇：左側快捷（今天、明天、一週後、月底）、右側月曆；選了就生效。方向鍵移動、Enter 選取、Esc 關閉。
 *   <div ccDatePicker [(value)]="due" label="結束日期" help="預設為一週後" [min]="today"></div>
 * 表單：值是 'YYYY-MM-DD'。表單停用時不能展開（展示牆尚無停用樣式）。
 */
@Component({
  selector: '[ccDatePicker]',
  hostDirectives: [FormBridge],
  imports: [Icon, SvgPath],
  host: { '[class]': 'cls()' },
  template: `<div class="dp-f" role="button" [attr.tabindex]="form.disabled() ? -1 : 0" [attr.aria-disabled]="form.disabled() || null" [attr.aria-label]="fieldLabel()" aria-haspopup="dialog" [attr.aria-expanded]="open()" (click)="!form.disabled() && open.set(!open())" (keydown)="onFieldKey($event)"><span class="roll"><span>{{ day() }}</span></span><svg ccIcon="calendar"></svg></div>@if (help()) {<div class="dp-h">{{ help() }}</div>}@if (open()) {<div class="dp-p" role="dialog" [attr.aria-label]="label()"><div class="dp-pre">@for (p of presets(); track p.label) {<span role="button" tabindex="0" [attr.class]="p.value === value() ? 'on' : null" (click)="pick(p.value)" (keydown.enter)="pick(p.value)">{{ p.label }}</span>}</div><div class="dp-c"><div class="dp-m"><span>{{ title() }}</span><span><svg class="ic" viewBox="0 0 24 24" role="button" tabindex="-1" aria-label="上個月" [ccPath]="prev" (click)="shift(-1)"></svg><svg class="ic" viewBox="0 0 24 24" role="button" tabindex="-1" aria-label="下個月" [ccPath]="next" (click)="shift(1)"></svg></span></div><div #grid class="dp-g" role="grid" tabindex="0" [attr.aria-label]="title()" (keydown)="onGridKey($event)"><i #sel class="dp-sel"></i>@for (w of week; track w) {<b>{{ w }}</b>}@for (d of cells(); track $index) {@if (d === null) {<span aria-hidden="true"></span>} @else {<span role="gridcell" [attr.aria-selected]="d === value()" [attr.class]="dayCls(d)" (click)="pick(d)">{{ date(d) }}</span>}}</div></div></div>}`,
})
export class DatePicker {
  /** 'YYYY-MM-DD'；空字串＝未選 */
  readonly value = model('');
  /** 讀屏名稱，例：「結束日期」 */
  readonly label = input.required<string>();
  /** 欄位下方的說明 */
  readonly help = input<string>();
  /** 最早可選（之前的日期變淡、不能選） */
  readonly min = input<string>();
  /** 今天（測試、資料截止日用）；預設是系統今天 */
  readonly today = input<string>();
  readonly open = model(false);

  protected readonly prev = MONTH_PREV;
  protected readonly next = MONTH_NEXT;
  protected readonly week = WEEK.split('');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly form = inject<FormBridge<string>>(FormBridge).attach(this.value, '');
  private readonly grid = viewChild<ElementRef<HTMLElement>>('grid');
  private readonly sel = viewChild<ElementRef<HTMLElement>>('sel');
  private readonly todayISO = computed(() => this.today() ?? todayISO());
  /** 顯示的月份、鍵盤游標；跟著 value 重設 */
  protected readonly view = signal<MonthView>([0, 0]);
  private readonly cursor = signal('');
  protected readonly cls = computed(() => cx('dp', this.open() && 'open'));
  protected readonly day = computed(() => (this.value() ? fmtDay(this.value()) : ''));
  protected readonly fieldLabel = computed(() => dateFieldLabel(this.label(), this.value()));
  protected readonly presets = computed(() => PRESETS(this.todayISO()));
  protected readonly title = computed(() => monthTitle(this.view()));
  protected readonly cells = computed(() => monthCells(...this.view()));
  protected readonly date = (d: string) => fromISO(d).getDate();
  protected dayCls(d: string) { return dayClass(d, this.value(), this.todayISO(), this.min()) ?? null; }

  constructor() {
    effect(() => { const v = this.value() || this.todayISO(); this.view.set(viewOf(v)); this.cursor.set(v); });
    effect((onCleanup) => { if (this.open()) onCleanup(onOutsidePointer(this.host.nativeElement, () => this.open.set(false))); });
    // 選中的圓：量選中日期格的位置（量法同展示牆）
    afterRenderEffect(() => { this.open(); this.value(); this.view(); placeDaySel(this.grid()?.nativeElement, this.sel()?.nativeElement); });
  }

  protected pick(d: string) { if (!canPickDay(d, this.min())) return; this.value.set(d); this.open.set(false); }
  protected shift(n: number) { this.view.set(shiftView(this.view(), n)); }
  protected onFieldKey(e: KeyboardEvent) { if (!this.form.disabled() && isDateOpenKey(e.key)) { e.preventDefault(); this.open.set(true); } }
  protected onGridKey(e: KeyboardEvent) {
    const r = dateGridKey(this.cursor(), e.key);
    if (!r) return;
    e.preventDefault();
    if (r.type === 'move') { this.cursor.set(r.cursor); this.view.set(r.view); }
    else if (r.type === 'pick') this.pick(this.cursor());
    else this.open.set(false);
  }
}

/**
 * 期間選擇：本月、近 30 天、近 90 天或自訂；範圍以文字寫出。選中片滑動，左右鍵切換。
 *   <div ccPeriodPicker [(value)]="period"></div>
 * 表單：值是期間代碼（PeriodKey）。表單停用時不能切換（展示牆尚無停用樣式）。
 */
@Component({
  selector: '[ccPeriodPicker]',
  hostDirectives: [FormBridge],
  imports: [Icon],
  template: `<div #ps class="ps" role="radiogroup" aria-label="期間" [attr.aria-disabled]="form.disabled() || null" (keydown)="onKey($event)"><i #pill></i>@for (p of periods; track p.key; let i = $index) {<span role="radio" [attr.aria-checked]="i === cur()" [attr.tabindex]="i === cur() && !form.disabled() ? 0 : -1" [attr.class]="i === cur() ? 'on' : null" (click)="!form.disabled() && value.set(p.key)">{{ p.label }}@if (p.key === 'custom') {<svg ccIcon="chevronDown"></svg>}</span>}</div><div class="ps-r">{{ range() }}</div>`,
})
export class PeriodPicker {
  readonly value = model<PeriodKey>('month');
  /** 「自訂」的起訖 'YYYY-MM-DD' */
  readonly custom = input<[string, string]>();
  /** 今天（測試、資料截止日用）；預設是系統今天 */
  readonly today = input<string>();

  protected readonly periods = PERIODS;
  protected readonly form = inject<FormBridge<PeriodKey>>(FormBridge).attach(this.value, PERIODS[0].key);
  private readonly ps = viewChild.required<ElementRef<HTMLElement>>('ps');
  private readonly pill = viewChild.required<ElementRef<HTMLElement>>('pill');
  protected readonly cur = computed(() => periodIndex(this.value()));
  protected readonly range = computed(() => periodText(this.value(), this.today() ?? todayISO(), this.custom()));

  constructor() {
    // 選中片：量選中項目的位置（量法同展示牆）
    afterRenderEffect(() => { this.value(); placePeriodPill(this.ps().nativeElement, this.pill().nativeElement); });
  }

  protected onKey(e: KeyboardEvent) {
    const n = periodKey(this.cur(), e.key);
    if (n === null || this.form.disabled()) return;
    e.preventDefault();
    this.value.set(PERIODS[n].key);
    focusNth(this.ps().nativeElement, '[role="radio"]', n);
  }
}
