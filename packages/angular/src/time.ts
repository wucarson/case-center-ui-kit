import { booleanAttribute, Component, computed, inject, input, model } from '@angular/core';
import { TIME_COLS, pad2, parseTime, timeKey, timeStep, type TimePart } from '@wucarson/facet-core/time';
import { FormBridge } from './form';
import { Icon } from './icon';

/**
 * 時間選擇：時、分各自上下調（各自循環，不互相進位）。數值格可聚焦，↑↓ 調整。
 *   <div ccTimePicker [(value)]="start" label="開始時間"></div>
 * 表單：值是 'HH:mm'。表單停用時不能調整（展示牆尚無停用樣式）。
 */
@Component({
  selector: '[ccTimePicker]',
  imports: [Icon],
  hostDirectives: [FormBridge],
  host: { class: 'tp', role: 'group', '[class.dis]': 'off()', '[attr.aria-label]': 'label()', '[attr.aria-disabled]': 'off() || null' },
  template: `<div class="tp-f" aria-hidden="true"><span class="roll"><span>{{ value() }}</span></span><svg ccIcon="clock"></svg></div><div class="tp-c">@for (c of cols; track c.part) {@if ($index === 1) {<b>:</b>}<div class="tp-col"><u role="button" tabindex="-1" [attr.aria-label]="c.name + '加一'" (click)="inc(c.part, 1)"><svg ccIcon="chevronUp"></svg></u><span class="v" role="spinbutton" [attr.tabindex]="off() ? -1 : 0" [attr.aria-label]="c.name" [attr.aria-valuenow]="hm()[$index]" aria-valuemin="0" [attr.aria-valuemax]="c.max" (keydown)="onKey($event, c.part)"><span class="roll"><span>{{ pad(hm()[$index]) }}</span></span></span><u role="button" tabindex="-1" [attr.aria-label]="c.name + '減一'" (click)="inc(c.part, -1)"><svg ccIcon="chevronDown"></svg></u></div>}</div>`,
})
export class TimePicker {
  /** 'HH:mm' */
  readonly value = model('00:00');
  /** 讀屏名稱，例：「開始時間」 */
  readonly label = input.required<string>();
  /** 分鐘每次調整幾分（預設 5） */
  readonly step = input(5);
  /** 停用（表單停用也會停用） */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly form = inject<FormBridge<string>>(FormBridge).attach(this.value, '00:00');
  protected readonly off = computed(() => this.disabled() || this.form.disabled());
  protected readonly cols = TIME_COLS;
  protected readonly pad = pad2;
  protected readonly hm = computed(() => parseTime(this.value()));
  protected inc(part: TimePart, d: 1 | -1) { if (this.off()) return; this.value.set(timeStep(this.value(), part, d, this.step())); }
  protected onKey(e: KeyboardEvent, part: TimePart) { const d = timeKey(e.key); if (d) { e.preventDefault(); this.inc(part, d); } }
}
