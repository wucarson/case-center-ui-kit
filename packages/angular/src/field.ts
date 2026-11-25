import { Component, Directive, ElementRef, InjectionToken, computed, contentChild, inject, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { SR_ONLY_STYLE, fieldClass, fieldInputClass, fieldMark, leftField } from '@case-center/core/field';

/** 自己就是輸入框區（.ff-i）的元件（放在欄位裡的下拉、多選）：欄位外框就不再包一層 */
export const FIELD_BOX = new InjectionToken<unknown>('FIELD_BOX');

/**
 * 表單欄位外框：標籤＋輸入框＋說明／錯誤。輸入框聚焦時整框換主色並加光圈。
 * 輸入框放在裡面；文字輸入加 ccFieldControl，必填、錯誤、唯讀、停用會自動帶到輸入框上。
 *   <div ccFormField label="工單名稱" required help="顯示在工單列表與通知" [counter]="count" htmlFor="name">
 *     <input ccFieldControl id="name" [(ngModel)]="name" maxlength="50">
 *   </div>
 * 下拉、多選直接放進來（它們自己就是輸入框區）：
 *   <div ccFormField label="所屬專案" required><div ccCombo [items]="projects" label="所屬專案"></div></div>
 */
@Component({
  selector: '[ccFormField]',
  imports: [NgTemplateOutlet],
  host: { '[class]': 'cls()', '(focusin)': 'focus.set(true)', '(focusout)': 'onOut($event)' },
  template: `<ng-template #content><ng-content /></ng-template><label class="ff-l" [attr.for]="htmlFor() ?? null">{{ label() }}@if (mark() === 'req') {<span class="req" aria-hidden="true">*</span>} @else if (mark() === 'opt') {<span class="opt">（選填）</span>}@if (required()) {<span class="sr-only" [style]="srOnly">必填</span>}@if (empty()) {<span class="ff-e">{{ emptyLabel() }}</span>}</label>@if (box()) {<ng-container *ngTemplateOutlet="content" />} @else {<div [class]="boxCls()"><ng-container *ngTemplateOutlet="content" /></div>}@if (!error()) {<div class="ff-h"><span>{{ help() }}</span>@if (counter()) {<span class="cnt" aria-live="polite">{{ counter() }}</span>}</div>}<div class="ff-x" [attr.role]="error() ? 'alert' : null">{{ error() }}</div>`,
})
export class FormField {
  readonly label = input.required<string>();
  /** 必填：標籤後加紅色星號 */
  readonly required = input(false);
  /** 選填：標籤後加「（選填）」 */
  readonly optional = input(false);
  /** 唯讀（系統帶入）：不標必填也不標選填 */
  readonly readOnly = input(false);
  readonly disabled = input(false);
  /** 必填且尚未填寫：標籤旁顯示「尚未填寫」 */
  readonly empty = input(false);
  readonly emptyLabel = input('尚未填寫');
  readonly help = input<string>();
  /** 字數，例：'4 / 50'（可用 core/field.ts 的 fieldCount 算） */
  readonly counter = input<string>();
  /** 錯誤訊息：位置先留好，出現時欄位不跳動 */
  readonly error = input<string>();
  /** 多行（輸入框較高、文字靠上） */
  readonly multiline = input(false);
  /** 給 label 對應的輸入框 id */
  readonly htmlFor = input<string>();

  protected readonly focus = signal(false);
  protected readonly srOnly = SR_ONLY_STYLE;
  protected readonly box = contentChild(FIELD_BOX);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly cls = computed(() => fieldClass({ readOnly: this.readOnly(), disabled: this.disabled(), error: this.error(), focus: this.focus() }));
  protected readonly boxCls = computed(() => fieldInputClass(this.multiline()));
  protected readonly mark = computed(() => fieldMark({ readOnly: this.readOnly(), required: this.required(), optional: this.optional() }));
  protected onOut(e: FocusEvent) { if (leftField(this.host.nativeElement, e.relatedTarget)) this.focus.set(false); }
}

/** 欄位裡的文字輸入框：從外框帶入必填、錯誤、唯讀、停用 */
@Directive({
  selector: 'input[ccFieldControl], textarea[ccFieldControl]',
  host: {
    '[attr.readonly]': 'field?.readOnly() ? "" : null',
    '[attr.disabled]': 'field?.disabled() ? "" : null',
    '[attr.aria-invalid]': 'field?.error() ? "true" : null',
    '[attr.aria-required]': 'field?.required() ? "true" : null',
  },
})
export class FieldControl {
  protected readonly field = inject(FormField, { optional: true });
}
