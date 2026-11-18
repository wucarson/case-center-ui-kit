import { Component, computed, input, output } from '@angular/core';
import {
  CALLOUT_ICON, EMPTY_ICON, TIMELINE_CLS, TIMELINE_ICON, avatarBg, badgeClass, badgeDot, calloutClass, calloutRole, emptyClass, emptyRole,
  skeletonClass, stepNote, stepState,
  type BadgeAppearance, type BadgeTone, type CalloutTone, type EmptyTone, type TimelineType,
} from '../../../core/display';
import { Button } from './button';
import { Icon } from './icon';

/**
 * 提示訊息：頁面內的提示框，不擋操作。操作結果回饋請用 Toast。
 *   <div ccCallout tone="warn" heading="有 3 張工單即將到期" text="請在 11-20 前完成。" [icon]="true"></div>
 */
@Component({
  selector: '[ccCallout]',
  imports: [Button, Icon],
  host: { '[class]': 'cls()', '[attr.role]': 'role()' },
  template: `@if (icon()) {<svg [ccIcon]="iconName()"></svg>}<div><strong>{{ heading() }}</strong>@if (text()) {<p>{{ text() }}</p>}</div>@if (action(); as a) {<button ccButton variant="outline" (click)="act.emit()">{{ a }}</button>}`,
})
export class Callout {
  readonly tone = input.required<CalloutTone>();
  /** 標題：一句話講完 */
  readonly heading = input.required<string>();
  /** 內文：補細節（選用） */
  readonly text = input<string>();
  /** 需要更醒目時加圖示 */
  readonly icon = input(false);
  /** 彈窗底部等空間有限處 */
  readonly compact = input(false);
  /** 明確的下一步（按鈕文字），例：「重試」 */
  readonly action = input<string>();
  /** 操作後才出現、要讓讀屏念出來（danger 一律念） */
  readonly live = input(false);
  readonly act = output<void>();

  protected readonly cls = computed(() => calloutClass(this.tone(), this.compact()));
  protected readonly role = computed(() => calloutRole(this.tone(), this.live()));
  protected readonly iconName = computed(() => CALLOUT_ICON[this.tone()]);
}

/**
 * 空狀態：沒有內容、查無結果或載入失敗時，說明原因並給下一步。
 *   <div ccEmptyState tone="info" heading="還沒有工單" text="建立第一張工單開始派工" action="新增工單" (act)="create()"></div>
 */
@Component({
  selector: '[ccEmptyState]',
  imports: [Button, Icon],
  host: { '[class]': 'cls()', '[attr.role]': 'role()' },
  template: `<span class="es-m"><svg [ccIcon]="iconName()"></svg></span><b>{{ heading() }}</b><p>{{ text() }}</p>@if (action(); as a) {<button ccButton variant="outline" (click)="act.emit()">{{ a }}</button>}`,
})
export class EmptyState {
  /** info＝還沒有內容；warn＝篩選後查無結果；danger＝載入失敗 */
  readonly tone = input.required<EmptyTone>();
  readonly heading = input.required<string>();
  /** 說明下一步 */
  readonly text = input.required<string>();
  /** 下一步的按鈕文字，例：「新增工單」「清除篩選」「重試」 */
  readonly action = input<string>();
  readonly act = output<void>();

  protected readonly cls = computed(() => emptyClass(this.tone()));
  protected readonly role = computed(() => emptyRole(this.tone()));
  protected readonly iconName = computed(() => EMPTY_ICON[this.tone()]);
}

/**
 * 狀態徽章：顏色＋圓點＋文字。狀態文字一定要寫出來，不要只靠顏色。
 *   <span ccStatusBadge label="進行中" tone="active"></span>
 */
@Component({
  selector: 'span[ccStatusBadge]',
  host: { '[class]': 'cls()' },
  template: `@if (dot()) {<i aria-hidden="true"></i>}{{ label() }}`,
})
export class StatusBadge {
  readonly label = input.required<string>();
  /** plan 規劃中（空心點）、active 進行中、pause 暫停、closed 已結案、danger 退回／逾期、none 不在對映表裡的值 */
  readonly tone = input.required<BadgeTone>();
  /** filled＝列表的狀態欄；outline＝頁首、卡片上；plain＝空間很小時 */
  readonly appearance = input<BadgeAppearance>('filled');
  /** 圓點（tone="none" 預設不顯示） */
  readonly showIndicator = input<boolean>();

  protected readonly dot = computed(() => badgeDot(this.tone(), this.showIndicator()));
  protected readonly cls = computed(() => badgeClass(this.tone(), this.appearance(), this.dot()));
}

export interface StepperStep {
  label: string;
  /** 補充：完成日、負責人・進行中；未開始可省略（顯示「未開始」） */
  note?: string;
}

/**
 * 流程步驟：完成打勾、目前加框、未開始虛線。只顯示進度，不能點。
 *   <div ccStepper [steps]="steps" [current]="1" aria-label="處理進度"></div>
 */
@Component({
  selector: '[ccStepper]',
  imports: [Icon],
  host: { class: 'fl', role: 'list' },
  template: `@for (s of steps(); track $index) {@let st = state($index);<div [class]="'fs ' + st" role="listitem" [attr.aria-current]="st === 'cur' ? 'step' : null"><p><svg ccIcon="check"></svg>{{ s.label }}</p><small>{{ note(st, s.note) }}</small></div>}`,
})
export class Stepper {
  readonly steps = input.required<StepperStep[]>();
  /** 目前階段的索引；之前的都算完成（-1＝都還沒開始） */
  readonly current = input.required<number>();
  protected state(i: number) { return stepState(i, this.current()); }
  protected readonly note = stepNote;
}

export interface TimelineItem {
  type: TimelineType;
  /** 人名＋動作，例：「李小美 變更狀態為「進行中」」 */
  text: string;
  /** 相對時間，例：「剛剛」「2 分鐘前」 */
  time: string;
}

/**
 * 歷程：最新的在最上面；每筆是圖示＋人名動作＋相對時間。
 *   <div ccTimeline [items]="items" aria-label="案件歷程"></div>
 */
@Component({
  selector: '[ccTimeline]',
  imports: [Icon],
  host: { class: 'nts', role: 'list' },
  template: `@for (it of items(); track $index) {<div class="nt" role="listitem"><i [class]="cls[it.type]" aria-hidden="true"><svg [ccIcon]="icon[it.type]"></svg></i><div><p>{{ it.text }}</p><small>{{ it.time }}</small></div></div>}`,
})
export class Timeline {
  /** 最新的放最前面 */
  readonly items = input.required<TimelineItem[]>();
  protected readonly cls = TIMELINE_CLS;
  protected readonly icon = TIMELINE_ICON;
}

/**
 * 骨架載入（人員列）：骨架形狀照實際內容，載入後不跳動。
 *   <div ccSkeleton [loading]="loading" [avatar]="{ initial: '王', color: 1 }" title="李小美" subtitle="設計師"></div>
 */
@Component({
  selector: '[ccSkeleton]',
  host: { '[class]': 'cls()', '[attr.aria-busy]': 'loading()' },
  template: `<div class="ghost" aria-hidden="true"><span class="av shim"></span><span class="ls"><b class="shim"></b><b class="shim"></b></span></div><div class="real" [attr.aria-hidden]="loading()"><span class="av" [style.background]="bg()">{{ avatar().initial }}</span><div><p>{{ title() }}</p><small>{{ subtitle() }}</small></div></div>`,
})
export class Skeleton {
  /** 載入中顯示骨架；false 時骨架淡出、內容淡入 */
  readonly loading = input.required<boolean>();
  /** 頭像：字與分類色 1–4 */
  readonly avatar = input.required<{ initial: string; color: 1 | 2 | 3 | 4 }>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();

  protected readonly cls = computed(() => skeletonClass(this.loading()));
  protected readonly bg = computed(() => avatarBg(this.avatar().color));
}
