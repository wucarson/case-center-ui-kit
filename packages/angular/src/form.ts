import { DestroyRef, Directive, ElementRef, Injector, forwardRef, inject, signal, type ModelSignal } from '@angular/core';
import { NG_VALUE_ACCESSOR, NgControl, type AbstractControl, type ControlValueAccessor } from '@angular/forms';

/**
 * 表單橋接：讓元件能用 ngModel、formControl、formControlName（ControlValueAccessor）。
 * 每個會產生值的元件都把它掛在 hostDirectives，元件裡用 attach() 接上自己的值（value 或 checked）：
 *   readonly value = model('');
 *   protected readonly form = inject(FormBridge).attach(this.value, '');
 * 表單的狀態轉成 signal，元件畫面直接讀：
 *   form.disabled()：表單停用（control.disable()）
 *   form.invalid()：驗證不通過且已碰過（touched）——顯示錯誤樣式的時機
 * 原本的 [(value)]／[(checked)] 照常可用；兩種寫法擇一。
 */
@Directive({
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FormBridge), multi: true }],
  host: { '(focusout)': 'onOut($event)' },
})
export class FormBridge<T = unknown> implements ControlValueAccessor {
  readonly disabled = signal(false);
  readonly invalid = signal(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private model?: ModelSignal<T>;
  private empty!: T;
  private writing = false;
  private onChange: (v: T) => void = () => {};
  private onTouched: () => void = () => {};

  /** 接上元件的值；empty＝表單給 null（reset()）時顯示的空值 */
  attach(model: ModelSignal<T>, empty: T): this {
    this.model = model;
    this.empty = empty;
    // 使用者操作改了值 → 通知表單；表單寫入（writeValue）時不回傳，避免來回
    const sub = model.subscribe((v) => { if (!this.writing) this.onChange(v); });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
    return this;
  }

  writeValue(v: T | null | undefined): void {
    this.writing = true;
    try { this.model?.set(v ?? this.empty); } finally { this.writing = false; }
  }
  registerOnChange(fn: (v: T) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
    // 表單已接上（setUpControl 的最後幾步）：這時 NgControl 一定有 control，開始追驗證與 touched
    const control = this.injector.get(NgControl, null, { self: true, optional: true })?.control;
    if (control) this.watch(control);
  }
  setDisabledState(d: boolean): void { this.disabled.set(d); }

  /** 焦點離開整個元件（不是移到元件裡的另一個元素）才算碰過 */
  protected onOut(e: FocusEvent): void {
    if (!this.host.nativeElement.contains(e.relatedTarget as Node | null)) this.onTouched();
  }

  private watch(control: AbstractControl): void {
    const update = () => this.invalid.set(control.invalid && control.touched);
    const sub = control.events.subscribe(update);
    this.destroyRef.onDestroy(() => sub.unsubscribe());
    update();
  }
}

