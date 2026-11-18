import { Component, ElementRef, afterEveryRender, computed, inject, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { buttonClass, type ButtonVariant } from '../../../core/button';
import type { IconName } from '../../../shared/icons';
import { Icon } from './icon';

/**
 * 按鈕。只有圖示時一定要給 aria-label。
 *   <button ccButton>儲存變更</button>
 *   <button ccButton variant="outline" size="lg">取消</button>
 *   <button ccButton variant="destructive" size="lg" icon="trash">刪除</button>
 */
@Component({
  selector: 'button[ccButton]',
  imports: [Icon, NgTemplateOutlet],
  host: {
    type: 'button',
    '[class]': 'cls()',
    '[disabled]': 'disabled() || loading()',
    '[attr.aria-busy]': 'loading() || null',
  },
  template: `<ng-template #label><ng-content /></ng-template>@if (loading()) {<i class="spin" aria-hidden="true"></i>}@if (icon(); as name) {<svg [ccIcon]="name"></svg>}@if (done()) {<span class="roll"><ng-container [ngTemplateOutlet]="label" /></span>} @else {<ng-container [ngTemplateOutlet]="label" />}`,
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<'lg' | 'sm'>();
  readonly icon = input<IconName>();
  readonly loading = input(false);
  readonly done = input(false);
  readonly disabled = input(false);

  private readonly host = inject<ElementRef<HTMLButtonElement>>(ElementRef);
  /** 沒有文字（只有圖示）：Angular 看不到投影內容是否為空，渲染後讀一次 */
  private readonly textless = signal(false);
  protected readonly cls = computed(() =>
    buttonClass({
      variant: this.variant(), size: this.size(), loading: this.loading(), done: this.done(), disabled: this.disabled(),
      iconOnly: !!this.icon() && this.textless(),
    }),
  );

  constructor() {
    afterEveryRender(() => this.textless.set(!this.host.nativeElement.textContent?.trim()));
  }
}
