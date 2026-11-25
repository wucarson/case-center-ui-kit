import { Component, Directive, ElementRef, computed, effect, inject, input, model, untracked } from '@angular/core';
import { focusNth } from '@case-center/core/choice';
import { chipExit, chipFocusAfter, chipRemoveLabel, chipsLabel, withoutAt } from '@case-center/core/chips';
import { isActivateKey } from '@case-center/core/dom';
import {
  countUp, legendDotStyle, segmentBarLabel, segmentStyle, segmentTotal, statClass, statsStyle, type BarSegment, type StatItem,
} from '@case-center/core/metrics';
import { fileTone, uploadBarLabel, uploadClass, uploadText, uploadWidth, type UploadStatus } from '@case-center/core/upload';
import { SvgPath } from './icon';

export type { BarSegment, StatItem, UploadStatus };

/** { '--c': 'x' } → '--c: x'（CSS 變數用 attr.style 綁，各版本行為一致） */
const css = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => k + ': ' + v).join('; ');

/** <b ccNum [value]="42" [animate]="true">：數字；animate 時換值從舊值滾到新值 */
@Directive({ selector: 'b[ccNum]', host: { class: 'num' } })
export class MetricNum {
  readonly value = input.required<number | string>({ alias: 'ccNum' });
  readonly animate = input(false);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private prev: number | string | undefined;
  constructor() {
    effect((onCleanup) => {
      const v = this.value(), from = this.prev;
      this.prev = v;
      if (untracked(this.animate) && typeof v === 'number' && typeof from === 'number') onCleanup(countUp(this.el, from, v));
      else this.el.textContent = String(v);
    });
  }
}

/**
 * 統計卡：一列重點數字；第一個常設為重點（hot，主色）。
 *   <div ccStatRow [items]="stats"></div>
 */
@Component({
  selector: '[ccStatRow]',
  imports: [MetricNum],
  host: { class: 'stats', role: 'list', '[attr.style]': 'style()' },
  template: `@for (s of items(); track s.label) {<div [class]="cls(s.hot)" role="listitem"><span>{{ s.label }}</span><b [ccNum]="s.value" [animate]="animate()"></b>@if (s.unit) {<small>{{ s.unit }}</small>}</div>}`,
})
export class StatRow {
  /** 2–4 個重點數字 */
  readonly items = input.required<StatItem[]>();
  /** 數字變動時滾動更新 */
  readonly animate = input(false);
  protected readonly style = computed(() => css(statsStyle(this.items().length)));
  protected readonly cls = statClass;
}

/**
 * 分段統計條：總數＋比例條＋圖例數字（顏色不是唯一資訊）。
 *   <div ccSegmentedBar [segments]="segs" unit="件工單"></div>
 */
@Component({
  selector: '[ccSegmentedBar]',
  imports: [MetricNum],
  host: { class: 'sb' },
  template: `<div class="sb-h"><b [ccNum]="total()" [animate]="animate()"></b><span>{{ unit() }}</span></div><div class="sb-b" role="img" [attr.aria-label]="barLabel()">@for (s of segments(); track s.label; let i = $index) {<i [attr.style]="seg(s, i)"></i>}</div><div class="sb-l">@for (s of segments(); track s.label; let i = $index) {<span><i [attr.style]="dot(s, i)"></i>{{ s.label }}<b [ccNum]="s.value" [animate]="animate()"></b></span>}</div>`,
})
export class SegmentedBar {
  readonly segments = input.required<BarSegment[]>();
  /** 總數後的單位，例：「件工單」 */
  readonly unit = input('件');
  readonly animate = input(false);
  protected readonly total = computed(() => segmentTotal(this.segments()));
  protected readonly barLabel = computed(() => segmentBarLabel(this.segments(), this.unit()));
  protected seg(s: BarSegment, i: number) { return css(segmentStyle(s, i)); }
  protected dot(s: BarSegment, i: number) { return css(legendDotStyle(s, i)); }
}

const FILE = '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>';

/**
 * 檔案上傳：一個附件的進度、完成或失敗；圖示顏色依檔案類型。
 *   <div ccUpload name="設計規範_v3.pdf" status="uploading" [progress]="45" [size]="2.4"></div>
 */
@Component({
  selector: '[ccUpload]',
  imports: [SvgPath],
  host: { '[class]': 'cls()' },
  template: `<span class="up-i" [attr.style]="tone()"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true" [ccPath]="file"></svg></span><div class="up-m"><div class="up-r"><span class="roll nm"><span>{{ name() }}</span></span><span class="st num" aria-live="polite">{{ text() }}</span></div><div class="up-b" role="progressbar" [attr.aria-label]="barLabel()" aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="now()"><i [style.width]="pct()"></i></div></div>`,
})
export class Upload {
  /** 檔名（含副檔名，圖示顏色依副檔名） */
  readonly name = input.required<string>();
  readonly status = input.required<UploadStatus>();
  /** 上傳進度 0–100 */
  readonly progress = input(0);
  /** 檔案大小（MB）：給了就寫「1.1 / 2.4 MB・45%」 */
  readonly size = input<number>();

  protected readonly file = FILE;
  protected readonly cls = computed(() => uploadClass(this.status()));
  protected readonly tone = computed(() => '--tone: ' + fileTone(this.name()));
  protected readonly pct = computed(() => uploadWidth(this.status(), this.progress()));
  protected readonly now = computed(() => parseFloat(this.pct()));
  protected readonly text = computed(() => uploadText(this.status(), this.progress(), this.size()));
  protected readonly barLabel = computed(() => uploadBarLabel(this.name()));
}

const X = '<path d="M6 6l12 12M18 6L6 18"/>';

/**
 * 篩選標籤：目前套用的篩選條件，可逐一移除（縮小淡出，焦點移到下一個）。
 *   <div ccFilterChips [(items)]="filters"></div>
 */
@Component({
  selector: '[ccFilterChips]',
  imports: [SvgPath],
  host: { class: 'chips', role: 'list', '[attr.aria-label]': 'ariaLabel() ?? listLabel' },
  template: `@for (t of items(); track t; let i = $index) {<span class="chip" role="listitem">{{ t }}<u role="button" tabindex="0" [attr.aria-label]="removeLabel(t)" (click)="remove(i, false)" (keydown)="onKey($event, i)"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true" [ccPath]="x"></svg></u></span>}`,
})
export class FilterChips {
  /** 目前套用的條件 */
  readonly items = model.required<string[]>();
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });

  protected readonly x = X;
  protected readonly listLabel = chipsLabel;
  protected readonly removeLabel = chipRemoveLabel;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected async remove(i: number, keyboard: boolean) {
    const n = this.items().length;
    await chipExit(this.host.children[i]);
    this.items.set(withoutAt(this.items(), i));
    const f = chipFocusAfter(i, n);
    if (keyboard && f >= 0) requestAnimationFrame(() => focusNth(this.host, '.chip u', f));
  }
  protected onKey(e: KeyboardEvent, i: number) { if (isActivateKey(e.key)) { e.preventDefault(); this.remove(i, true); } }
}
