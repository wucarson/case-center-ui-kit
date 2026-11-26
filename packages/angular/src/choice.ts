import { booleanAttribute, Component, ElementRef, computed, inject, input, model, output, signal } from '@angular/core';
import { cx, isFocusVisible } from '@wucarson/facet-core/dom';
import {
  STAR_PATH, checkboxAttrs, checkboxClass, checkboxNext, focusNth, isCheckboxToggleKey, isStarToggleKey, radioClass, radioKey, radioMove,
  radioTabIndex, segmentedClass, segmentedColumns, segmentedKey, segmentedThumb, starClass,
  type CheckboxState, type RadioOption,
} from '@wucarson/facet-core/choice';
import { burst } from '@wucarson/facet-core/burst';
import { FormBridge } from './form';
import { Icon } from './icon';

export type { RadioOption };

/**
 * 核取方塊：要按儲存才生效的多選。Space 切換。
 *   <div ccCheckbox [(checked)]="sync" label="同步通知負責人"></div>
 * 表單：<div ccCheckbox formControlName="agree" label="我已閱讀"></div>（必填用 Validators.requiredTrue）
 */
@Component({
  selector: '[ccCheckbox]',
  hostDirectives: [FormBridge],
  imports: [Icon],
  host: {
    role: 'checkbox',
    '[class]': 'cls()',
    '[attr.aria-checked]': 'attrs()["aria-checked"]',
    '[attr.aria-disabled]': 'attrs()["aria-disabled"]',
    '[attr.tabindex]': 'attrs().tabindex',
    '(click)': 'toggle()',
    '(keydown)': 'onKey($event)',
    '(focus)': 'focusVisible.set(isFocusVisible(host.nativeElement))',
    '(blur)': 'focusVisible.set(false)',
  },
  template: `<i [class.is-focus]="focusVisible()"><svg ccIcon="check" class="chk"></svg><svg ccIcon="dash" class="dash"></svg></i>@if (label()) {<span>{{ label() }}</span>}`,
})
export class Checkbox {
  readonly checked = model(false);
  /** 部分選取（全選的半選狀態） */
  readonly indeterminate = input(false);
  readonly label = input<string>();
  /** 全選列：粗體、下方分隔線 */
  readonly selectAll = input(false);
  readonly disabled = input(false);

  protected readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly form = inject<FormBridge<boolean>>(FormBridge).attach(this.checked, false);
  protected readonly isFocusVisible = isFocusVisible;
  protected readonly focusVisible = signal(false);
  private readonly state = computed<CheckboxState>(() => ({ checked: this.checked(), indeterminate: this.indeterminate(), selectAll: this.selectAll(), disabled: this.disabled() || this.form.disabled() }));
  protected readonly cls = computed(() => checkboxClass(this.state()));
  protected readonly attrs = computed(() => checkboxAttrs(this.state()));

  protected toggle() { const next = checkboxNext(this.state()); if (next !== null) this.checked.set(next); }
  protected onKey(e: KeyboardEvent) { if (isCheckboxToggleKey(e.key)) { e.preventDefault(); this.toggle(); } }
}

export interface CheckboxListItem { label?: string; checked?: boolean; indeterminate?: boolean; selectAll?: boolean; disabled?: boolean }

/** 一組核取方塊（垂直排列）。第一項可設 selectAll。 */
@Component({
  selector: '[ccCheckboxList]',
  imports: [Checkbox],
  host: { class: 'cks', role: 'group' },
  template: `@for (it of items(); track $index) {<div ccCheckbox [checked]="!!it.checked" [indeterminate]="!!it.indeterminate" [selectAll]="!!it.selectAll" [disabled]="!!it.disabled" [label]="it.label" (checkedChange)="change.emit({ index: $index, checked: $event })"></div>}`,
})
export class CheckboxList {
  readonly items = input.required<CheckboxListItem[]>();
  readonly change = output<{ index: number; checked: boolean }>();
}

/**
 * 單選清單：2–5 個互斥選項、選項都看得到。方向鍵切換（跳過停用項）。
 *   <div ccRadioGroup [options]="options" [(value)]="groupBy" aria-label="分組方式"></div>
 * 表單：<div ccRadioGroup [options]="options" formControlName="groupBy" aria-label="分組方式"></div>
 */
@Component({
  selector: '[ccRadioGroup]',
  hostDirectives: [FormBridge],
  host: { role: 'radiogroup', '[class.rads]': '!single()', '[style.display]': 'single() ? "contents" : null' },
  template: `@for (o of opts(); track o.value) {<div role="radio" [attr.aria-checked]="o.value === value()" [attr.aria-disabled]="o.disabled || null" [attr.tabindex]="tab($index)" [class]="radioCls(o)" (click)="pick(o)" (keydown)="onKey($event, $index)" (focus)="onFocus($event, $index)" (blur)="focusAt.set(-1)"><i [class.is-focus]="focusAt() === $index"></i>@if (o.description) {<span><b>{{ o.label }}</b><small>{{ o.description }}</small></span>} @else {<ng-container>{{ o.label }}</ng-container>}</div>}`,
})
export class RadioGroup {
  readonly options = input.required<RadioOption[]>();
  readonly value = model<string>();
  /** 只有一個選項、不包外層清單（展示單一狀態用） */
  readonly single = input(false);
  /** 停用（表單停用也會停用） */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly form = inject<FormBridge<string | undefined>>(FormBridge).attach(this.value, undefined);
  protected readonly off = computed(() => this.disabled() || this.form.disabled());
  /** 表單停用時每個選項都停用 */
  protected readonly opts = computed(() => (this.off() ? this.options().map((o) => ({ ...o, disabled: true })) : this.options()));
  protected readonly focusAt = signal(-1);
  protected tab(i: number) { return radioTabIndex(this.opts(), this.value(), i); }
  protected radioCls(o: RadioOption) { return radioClass(o, o.value === this.value()); }
  protected pick(o: RadioOption) { if (!o.disabled) this.value.set(o.value); }
  protected onKey(e: KeyboardEvent, i: number) {
    const r = radioKey(e.key);
    if (!r) return;
    e.preventDefault();
    if (r.type === 'pick') { this.pick(this.opts()[i]); return; }
    const j = radioMove(this.opts(), i, r.dir);
    if (j < 0) return;
    this.value.set(this.opts()[j].value);
    focusNth(this.host.nativeElement, '[role="radio"]', j);
  }
  protected onFocus(e: FocusEvent, i: number) { this.focusAt.set(isFocusVisible(e.currentTarget as Element) ? i : -1); }
}

/**
 * 分段切換：選中片彈性滑動。左右鍵切換。
 *   <div ccSegmented [options]="['日', '週', '月']" [(value)]="range" aria-label="時間範圍"></div>
 * 表單：值是選中的索引（number）。表單停用時不能操作（展示牆尚無停用樣式）。
 */
@Component({
  selector: '[ccSegmented]',
  hostDirectives: [FormBridge],
  host: { role: 'radiogroup', '[class]': 'cls()', '[style.grid-template-columns]': 'columns()', '[attr.aria-disabled]': 'off() || null' },
  template: `<i [style]="thumb()"></i>@for (t of options(); track t) {<span role="radio" [attr.aria-checked]="$index === value()" [attr.tabindex]="$index === value() && !off() ? 0 : -1" [class.on]="$index === value()" (click)="select($index)" (keydown)="onKey($event, $index)">{{ t }}</span>}`,
})
export class Segmented {
  /** 2–4 個互斥選項 */
  readonly options = input.required<string[]>();
  /** 選中的索引 */
  readonly value = model(0);
  /** sm＝對話框、卡片內 */
  readonly size = input<'md' | 'sm'>('md');
  /** 停用（表單停用也會停用） */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly form = inject<FormBridge<number>>(FormBridge).attach(this.value, 0);
  protected readonly off = computed(() => this.disabled() || this.form.disabled());
  protected readonly cls = computed(() => cx(segmentedClass(this.size()), this.off() && 'dis'));
  protected select(i: number) { if (!this.off()) this.value.set(i); }
  protected readonly columns = computed(() => segmentedColumns(this.options().length));
  protected readonly thumb = computed(() => segmentedThumb(this.options().length, this.value()));
  protected onKey(e: KeyboardEvent, i: number) {
    const r = segmentedKey(e.key, i, this.options().length);
    if (!r || this.off()) return;
    e.preventDefault();
    this.value.set(r.index);
    if (r.focus) focusNth(this.host.nativeElement, '[role="radio"]', r.index);
  }
}

/**
 * 追蹤星號：點一下追蹤（填滿＋星光）、再點取消。Enter／Space 切換。
 *   <span ccStarToggle [(on)]="following" label="追蹤案件"></span>
 */
@Component({
  selector: 'span[ccStarToggle]',
  host: {
    role: 'button',
    tabindex: '0',
    '[class]': 'cls()',
    '[attr.aria-pressed]': 'on()',
    '[attr.aria-label]': 'label()',
    '(click)': 'toggle()',
    '(keydown)': 'onKey($event)',
  },
  template: `<svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="path"></path></svg>`,
})
export class StarToggle {
  readonly on = model(false);
  /** 讀屏名稱，例：「追蹤案件」 */
  readonly label = input.required<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly path = STAR_PATH;
  protected readonly cls = computed(() => starClass(this.on()));
  protected toggle() { if (!this.on()) burst(this.host.nativeElement); this.on.set(!this.on()); }
  protected onKey(e: KeyboardEvent) { if (isStarToggleKey(e.key)) { e.preventDefault(); this.toggle(); } }
}
