import { Component, ElementRef, computed, inject, input, model, signal } from '@angular/core';
import { isFocusVisible } from '@wucarson/facet-core/dom';
import { isSwitchToggleKey, switchNext, switchRootAttrs, switchRootClass, switchTrackClass, type SwitchState } from '@wucarson/facet-core/switch';

/**
 * 開關：立即生效，不用再按儲存。Space／Enter 切換。
 * 用法：<div ccSwitch [(checked)]="on" label="到期前提醒"></div>
 * 沒有可見標籤時，在同一個元素加 aria-label。
 */
@Component({
  selector: '[ccSwitch]',
  host: {
    role: 'switch',
    '[class]': 'rootClass()',
    '[attr.aria-checked]': 'attrs()["aria-checked"]',
    '[attr.aria-disabled]': 'attrs()["aria-disabled"]',
    '[attr.tabindex]': 'attrs().tabindex',
    '(click)': 'toggle()',
    '(keydown)': 'onKey($event)',
    '(focus)': 'focusVisible.set(isFocusVisible(host.nativeElement))',
    '(blur)': 'focusVisible.set(false)',
  },
  template: `@if (label()) {<span>{{ label() }}</span>}<span [class]="trackClass()"><i></i></span>`,
})
export class Switch {
  readonly checked = model(false);
  /** 標籤：放在左邊 */
  readonly label = input<string>();
  /** sm＝欄位面板、表格內 */
  readonly size = input<'md' | 'sm'>('md');
  readonly disabled = input(false);

  protected readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly isFocusVisible = isFocusVisible;
  protected readonly focusVisible = signal(false);
  private readonly state = computed<SwitchState>(() => ({ checked: this.checked(), disabled: this.disabled(), size: this.size() }));
  protected readonly rootClass = computed(() => switchRootClass(this.state()));
  protected readonly trackClass = computed(() => switchTrackClass(this.state(), this.focusVisible()));
  protected readonly attrs = computed(() => switchRootAttrs(this.state()));

  protected toggle() {
    const next = switchNext(this.state());
    if (next !== null) this.checked.set(next);
  }

  protected onKey(e: KeyboardEvent) {
    if (!isSwitchToggleKey(e.key)) return;
    e.preventDefault();
    this.toggle();
  }
}
