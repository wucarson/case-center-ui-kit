import { Component, computed, effect, input, output, signal } from '@angular/core';
import { HOLD_MS, HoldControl, holdClass, holdFill, holdHint, holdText, isHoldKey, type HoldPhase } from '@case-center/core/hold';
import { Icon } from './icon';

let seq = 0;

/**
 * 按住確認：按住一段時間才送出；放開、移出或按 Esc 就取消。鍵盤按住 Space／Enter。
 *   <div ccHoldConfirm label="結案" (confirm)="close()"></div>
 */
@Component({
  selector: '[ccHoldConfirm]',
  imports: [Icon],
  host: { class: 'hold-c' },
  template: `<button type="button" [class]="cls()" [disabled]="disabled()" [attr.aria-describedby]="hintId" (pointerdown)="onDown($event)" (pointerup)="ctl.release()" (pointercancel)="ctl.release()" (lostpointercapture)="ctl.release()" (keydown)="onKey($event)" (keyup)="onKeyUp($event)" (blur)="ctl.release()"><i class="fill" [style.transform]="fill()"></i><i class="bar" [style.transform]="fill()"></i><span class="roll"><span>@if (shown() === 'done') {<svg ccIcon="check" class="draw"></svg>}{{ text() }}</span></span></button><div [id]="hintId" class="hold-h">{{ hint() ?? defaultHint() }}</div>`,
})
export class HoldConfirm {
  /** 動作名稱，例：「結案」→ 按鈕寫「按住結案」 */
  readonly label = input.required<string>();
  /** 按住多久（ms，預設 1500） */
  readonly duration = input(HOLD_MS);
  /** 下方說明；預設「按住 1.5 秒才會送出」 */
  readonly hint = input<string>();
  readonly disabled = input(false);
  /** 固定顯示按住進度 0–1（展示、文件用） */
  readonly progress = input<number>();
  /** 固定顯示完成（展示、文件用） */
  readonly done = input(false);
  readonly confirm = output<void>();

  protected readonly hintId = `cc-hold-${++seq}`;
  private readonly p = signal(0);
  private readonly phase = signal<HoldPhase>('idle');
  protected readonly ctl = new HoldControl((v, ph) => { this.p.set(v); this.phase.set(ph); }, () => this.confirm.emit());
  protected readonly shown = computed<HoldPhase>(() => (this.done() ? 'done' : this.progress() !== undefined ? 'holding' : this.phase()));
  protected readonly cls = computed(() => holdClass(this.shown(), this.disabled()));
  protected readonly text = computed(() => holdText(this.label(), this.shown()));
  protected readonly fill = computed(() => holdFill(this.progress() ?? this.p()));
  protected readonly defaultHint = computed(() => holdHint(this.duration()));

  constructor() { effect(() => { this.ctl.duration = this.duration(); }); }
  ngOnDestroy() { this.ctl.dispose(); }

  private press() { if (!this.disabled()) this.ctl.press(); }
  protected onDown(e: PointerEvent) { if (e.button === 0) { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); this.press(); } }
  protected onKey(e: KeyboardEvent) {
    if (isHoldKey(e.key)) { e.preventDefault(); if (!e.repeat) this.press(); }
    else if (e.key === 'Escape') this.ctl.release();
  }
  protected onKeyUp(e: KeyboardEvent) { if (isHoldKey(e.key)) this.ctl.release(); }
}
