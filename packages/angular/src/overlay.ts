import { Component, ElementRef, afterNextRender, afterRenderEffect, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { cx, isActivateKey, isFocusVisible, onOutsidePointer } from '@case-center/core/dom';
import {
  DIALOG_OVERLAY_STYLE, POPOVER_DELAY, PopoverControl, dialogCancelClass, dialogClass, dialogFocusKey, dialogKey, dialogOkClass, dialogTitleId,
  focusDialogButton, placePopoverArrow, popoverButtonLabel, popoverId, popoverKey, type DialogButton, type DialogFocus,
} from '@case-center/core/overlay';
import {
  TOASTER_STYLE, TOAST_ICON, dismiss, getToasts, isToastActionKey, subscribeToasts, toast, toastClass, type ToastData, type ToastTone,
} from '@case-center/core/toast';
import { Icon } from './icon';

export { toast, dismiss, type ToastData };

/**
 * 確認對話框：需要確認才繼續。Esc＝取消；Tab 只在兩顆按鈕間移動。
 *   <div ccConfirmDialog [open]="asking" title="刪除里程碑" body="「現場勘查」將從這個專案移除。" destructive (confirm)="remove()" (cancel)="asking = false"></div>
 * 浮起時元件會移到 <body> 底下（同 React 的 portal），蓋住整個視窗；inline＝只畫對話框本體（展示、文件用）。
 */
@Component({
  selector: '[ccConfirmDialog]',
  imports: [NgTemplateOutlet],
  host: {
    '[class]': 'hostCls()',
    '[style]': 'hostStyle()',
    '[attr.role]': 'inline() && open() ? "dialog" : null',
    '[attr.aria-labelledby]': 'inline() && open() ? titleId : null',
    '(keydown)': 'inline() && onKey($event)',
  },
  template: `<ng-template #content><b [id]="titleId">{{ title() }}</b><p><span>{{ body() }}</span>@if (note()) {<small>{{ note() }}</small>}</p><div class="dl-a"><span [class]="cancelCls()" role="button" tabindex="0" (click)="cancel.emit()" (keydown)="onBtnKey($event, 'cancel')" (focus)="onFocus($event, 'cancel')" (blur)="fv.set(null)">{{ cancelLabel() }}</span><span [class]="okCls()" role="button" tabindex="0" (click)="confirm.emit()" (keydown)="onBtnKey($event, 'ok')" (focus)="onFocus($event, 'ok')" (blur)="fv.set(null)">{{ confirmLabel() ?? title() }}</span></div></ng-template>@if (open()) {@if (inline()) {<ng-container *ngTemplateOutlet="content" />} @else {<i class="dl-bd" (click)="cancel.emit()"></i><div #card [class]="cardCls" role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId" (keydown)="onKey($event)"><ng-container *ngTemplateOutlet="content" /></div>}}`,
})
export class ConfirmDialog {
  readonly open = input.required<boolean>();
  /** 與觸發按鈕同名，不寫「確定要…嗎？」 */
  readonly title = input.required<string>();
  readonly body = input.required<string>();
  /** 補充說明，較弱字色（例：影響範圍） */
  readonly note = input<string>();
  /** 確認鈕文字，通常與標題相同 */
  readonly confirmLabel = input<string>();
  readonly cancelLabel = input('取消');
  /** 破壞性：確認鈕紅底，焦點先在取消 */
  readonly destructive = input(false);
  /** 只畫對話框本體、不浮起（展示、文件用） */
  readonly inline = input(false);
  /** 一開始聚焦的按鈕（預設：破壞性＝取消，其他＝確認） */
  readonly initialFocus = input<DialogFocus>();
  readonly confirm = output<void>();
  readonly cancel = output<void>();

  protected readonly titleId = dialogTitleId();
  protected readonly cardCls = dialogClass(false);
  protected readonly fv = signal<DialogButton | null>(null);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly card = viewChild<ElementRef<HTMLElement>>('card');
  protected readonly hostCls = computed(() => (!this.open() ? '' : this.inline() ? dialogClass(true) : 'dl open'));
  protected readonly hostStyle = computed(() => (!this.open() ? { display: 'none' } : this.inline() ? null : DIALOG_OVERLAY_STYLE));
  protected readonly cancelCls = computed(() => dialogCancelClass(this.fv()));
  protected readonly okCls = computed(() => dialogOkClass(this.fv(), this.destructive()));
  private readonly focusKey = computed(() => dialogFocusKey(this.initialFocus(), this.destructive()));

  constructor() {
    // 浮起時移到 <body> 底下，不受外層 overflow、transform 影響
    afterNextRender(() => { if (!this.inline()) document.body.appendChild(this.host.nativeElement); });
    // 打開：焦點落在預設按鈕；關閉：焦點回到原本的地方
    let prev: HTMLElement | null = null;
    afterRenderEffect(() => {
      const open = this.open();
      if (this.inline() || this.focusKey() === 'none') return;
      untracked(() => {
        if (open && !prev) { prev = document.activeElement as HTMLElement | null; focusDialogButton(this.card()?.nativeElement, this.focusKey()); }
        else if (!open && prev) { prev.focus?.(); prev = null; }
      });
    });
  }

  private cardEl() { return this.inline() ? this.host.nativeElement : this.card()?.nativeElement; }
  protected onKey(e: KeyboardEvent) { if (dialogKey(this.cardEl(), e, () => this.cancel.emit())) e.preventDefault(); }
  protected onBtnKey(e: KeyboardEvent, k: DialogButton) { if (isActivateKey(e.key)) { e.preventDefault(); (k === 'ok' ? this.confirm : this.cancel).emit(); } }
  protected onFocus(e: FocusEvent, k: DialogButton) { this.fv.set(isFocusVisible(e.currentTarget as Element) ? k : null); }
}

/**
 * 資訊提示：滑過 150ms 打開、點擊釘住、Esc 關閉。氣泡箭頭對準 ⓘ。說明文字放在元件裡面。
 *   <div ccInfoPopover label="加權進度" value="68%" valueNote="3 / 5 個里程碑">依里程碑權重加總；沒設權重的平均分配。</div>
 */
@Component({
  selector: '[ccInfoPopover]',
  imports: [Icon],
  host: { class: 'ip' },
  template: `<div class="ip-l">{{ label() }}<span #btn [class]="btnCls()" role="button" tabindex="0" [attr.aria-label]="btnLabel()" [attr.aria-expanded]="open()" [attr.aria-describedby]="open() ? id : null" (mouseenter)="ctl.enter()" (mouseleave)="ctl.leave()" (click)="ctl.toggle()" (keydown)="onKey($event)" (focus)="focusVisible.set(isFocusVisible($any($event.currentTarget)))" (blur)="focusVisible.set(false)"><svg ccIcon="info"></svg></span></div>@if (value() !== undefined) {<div class="ip-v">{{ value() }}@if (valueNote()) {<small>{{ valueNote() }}</small>}</div>}@if (open()) {<div #pop [id]="id" class="ip-p show" role="tooltip"><ng-content /></div>}`,
})
export class InfoPopover {
  /** 標籤（ⓘ 放在它後面） */
  readonly label = input.required<string>();
  /** 指標值與補充（選用），例：68%、3 / 5 個里程碑 */
  readonly value = input<string>();
  readonly valueNote = input<string>();
  /** 一開始就打開 */
  readonly defaultOpen = input(false);
  /** 滑過多久打開（ms，預設 150） */
  readonly openDelay = input(POPOVER_DELAY);

  protected readonly open = signal(false);
  private readonly pinned = signal(false);
  protected readonly ctl = new PopoverControl((o, p) => { this.open.set(o); this.pinned.set(p); });
  protected readonly id = popoverId();
  protected readonly isFocusVisible = isFocusVisible;
  protected readonly focusVisible = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly btn = viewChild.required<ElementRef<HTMLElement>>('btn');
  private readonly pop = viewChild<ElementRef<HTMLElement>>('pop');
  protected readonly btnCls = computed(() => cx('ip-b', this.focusVisible() && 'fc'));
  protected readonly btnLabel = computed(() => popoverButtonLabel(this.label()));

  constructor() {
    effect(() => { this.ctl.delay = this.openDelay(); });
    effect((onCleanup) => { if (this.pinned()) onCleanup(onOutsidePointer(this.host.nativeElement, () => this.ctl.close())); });
    // 箭頭位置：ⓘ 的中心（相對氣泡左緣），量法同展示牆
    afterRenderEffect(() => { if (this.open()) placePopoverArrow(this.btn().nativeElement, this.pop()?.nativeElement); });
  }

  ngOnInit() { if (this.defaultOpen()) { this.ctl.open = true; this.open.set(true); } }
  ngOnDestroy() { this.ctl.dispose(); }

  protected onKey(e: KeyboardEvent) {
    const r = popoverKey(e.key);
    if (r === 'toggle') { e.preventDefault(); this.ctl.toggle(); }
    else if (r === 'close') this.ctl.close();
  }
}

/**
 * 單則提示（.toast）。全站提示用 toast({ title }) 呼叫，<div ccToaster></div> 放在 App 最外層一次。
 *   <div ccToast title="已移除成員" detail="王小明" [action]="{ label: '復原', onClick: undo }"></div>
 */
@Component({
  selector: '[ccToast]',
  imports: [Icon],
  host: { '[class]': 'cls()', role: 'status' },
  template: `<svg [ccIcon]="icon()"></svg><div><b>{{ title() }}</b>@if (detail()) {<small>{{ detail() }}</small>}</div>@if (action(); as a) {<em role="button" tabindex="0" (click)="run()" (keydown)="onKey($event)">{{ a.label }}</em>}`,
})
export class Toast {
  /** 主訊息，寫結果：「已儲存」 */
  readonly title = input.required<string>();
  /** 補述，例：「等待 陳大文 覆核」 */
  readonly detail = input<string>();
  readonly tone = input<ToastTone>('ok');
  /** 給了就顯示動作（例：「復原」） */
  readonly action = input<ToastData['action']>();
  readonly act = output<void>();

  protected readonly cls = computed(() => toastClass(this.tone()));
  protected readonly icon = computed(() => TOAST_ICON[this.tone()]);
  protected run() { this.action()?.onClick?.(); this.act.emit(); }
  protected onKey(e: KeyboardEvent) { if (isToastActionKey(e.key)) this.run(); }
}

/** 全站提示容器：放在 App 最外層一次（固定在右下角） */
@Component({
  selector: '[ccToaster]',
  imports: [Toast],
  host: { 'aria-live': 'polite', '[style]': 'style' },
  template: `@for (t of list(); track t.id) {<div ccToast [title]="t.title" [detail]="t.detail" [tone]="t.tone ?? 'ok'" [action]="t.action" (act)="dismiss(t.id)"></div>}`,
})
export class Toaster {
  protected readonly style = TOASTER_STYLE;
  protected readonly list = signal(getToasts());
  protected readonly dismiss = dismiss;
  private readonly off = subscribeToasts(() => this.list.set(getToasts()));
  ngOnDestroy() { this.off(); }
}
