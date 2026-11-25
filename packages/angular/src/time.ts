import { Component, computed, input, model } from '@angular/core';
import { TIME_COLS, pad2, parseTime, timeKey, timeStep, type TimePart } from '@wucarson/facet-core/time';
import { Icon } from './icon';

/**
 * 時間選擇：時、分各自上下調（各自循環，不互相進位）。數值格可聚焦，↑↓ 調整。
 *   <div ccTimePicker [(value)]="start" label="開始時間"></div>
 */
@Component({
  selector: '[ccTimePicker]',
  imports: [Icon],
  host: { class: 'tp', role: 'group', '[attr.aria-label]': 'label()' },
  template: `<div class="tp-f" aria-hidden="true"><span class="roll"><span>{{ value() }}</span></span><svg ccIcon="clock"></svg></div><div class="tp-c">@for (c of cols; track c.part) {@if ($index === 1) {<b>:</b>}<div class="tp-col"><u role="button" tabindex="-1" [attr.aria-label]="c.name + '加一'" (click)="inc(c.part, 1)"><svg ccIcon="chevronUp"></svg></u><span class="v" role="spinbutton" tabindex="0" [attr.aria-label]="c.name" [attr.aria-valuenow]="hm()[$index]" aria-valuemin="0" [attr.aria-valuemax]="c.max" (keydown)="onKey($event, c.part)"><span class="roll"><span>{{ pad(hm()[$index]) }}</span></span></span><u role="button" tabindex="-1" [attr.aria-label]="c.name + '減一'" (click)="inc(c.part, -1)"><svg ccIcon="chevronDown"></svg></u></div>}</div>`,
})
export class TimePicker {
  /** 'HH:mm' */
  readonly value = model.required<string>();
  /** 讀屏名稱，例：「開始時間」 */
  readonly label = input.required<string>();
  /** 分鐘每次調整幾分（預設 5） */
  readonly step = input(5);

  protected readonly cols = TIME_COLS;
  protected readonly pad = pad2;
  protected readonly hm = computed(() => parseTime(this.value()));
  protected inc(part: TimePart, d: 1 | -1) { this.value.set(timeStep(this.value(), part, d, this.step())); }
  protected onKey(e: KeyboardEvent, part: TimePart) { const d = timeKey(e.key); if (d) { e.preventDefault(); this.inc(part, d); } }
}
