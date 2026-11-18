import { Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CASES, type Case } from '../../shared/cases';
import { Button } from './app/button';
import { Checkbox, CheckboxList, RadioGroup, Segmented, StarToggle } from './app/choice';
import { Callout, EmptyState, Skeleton, StatusBadge, Stepper, Timeline } from './app/display';
import { Menu, MenuPanel } from './app/menu';
import { Pagination } from './app/pagination';
import { Switch } from './app/switch';
import { DetailTabs, Tabs } from './app/tabs';
import { TimePicker } from './app/time';

const only = new URLSearchParams(location.search).get('c');

/**
 * 展示頁：把 shared/cases.ts 的案例用 Angular 元件畫出來，給 tools/compare.mjs 截圖比對。
 * 每個元件一個 ng-template（p＝案例參數）；外框、wrap、group 由 #box 統一處理（同 React 的 CaseView）。
 */
@Component({
  selector: 'cc-demo',
  imports: [
    NgTemplateOutlet, Button, Callout, Checkbox, CheckboxList, DetailTabs, EmptyState, Menu, MenuPanel, Pagination, RadioGroup, Segmented,
    Skeleton, StarToggle, StatusBadge, Stepper, Switch, Tabs, TimePicker, Timeline,
  ],
  host: { style: 'display: block' },
  template: `@let refs = { switch: tSwitch, menu: tMenu, button: tButton, 'status-badge': tBadge, callout: tCallout, 'empty-state': tEmpty, timeline: tTimeline, skeleton: tSkeleton, stepper: tStepper, checkbox: tCheckbox, 'radio-group': tRadio, segmented: tSegmented, tabs: tTabs, 'detail-tabs': tDetailTabs, 'star-toggle': tStar, pagination: tPagination, 'time-picker': tTime };
  <main class="cases">
    @for (e of list; track e.name) {
      @for (c of e.cases; track c.id) {
        <ng-container *ngTemplateOutlet="box; context: { $implicit: c, name: e.name, tpl: $any(refs)[e.name] }" />
      }
    }
  </main>

  <ng-template #box let-c let-name="name" let-tpl="tpl">
    <div class="case" [attr.data-c]="name" [attr.data-id]="c.id" [attr.data-interact]="interact(c)">
      @if (!c.wrap) {
        <ng-container *ngTemplateOutlet="body; context: { $implicit: c, tpl }" />
      } @else if (c.wrapTag === 'span') {
        <span [style]="c.wrap"><ng-container *ngTemplateOutlet="body; context: { $implicit: c, tpl }" /></span>
      } @else {
        <div [style]="c.wrap"><ng-container *ngTemplateOutlet="body; context: { $implicit: c, tpl }" /></div>
      }
    </div>
  </ng-template>
  <ng-template #body let-c let-tpl="tpl">
    @if (c.group) {
      @for (p of c.group; track $index) {<ng-container *ngTemplateOutlet="tpl; context: { $implicit: p }" />}
    } @else {
      <ng-container *ngTemplateOutlet="tpl; context: { $implicit: c.props ?? {} }" />
    }
  </ng-template>

  <ng-template #tSwitch let-p><div ccSwitch [attr.aria-label]="p['aria-label'] ?? null" [checked]="p.checked" [label]="p.label" [size]="p.size ?? 'md'" [disabled]="!!p.disabled" [style]="p.style ?? null"></div></ng-template>
  <ng-template #tMenu let-p>
    @if (p.inline) {<div class="mn pin"><div ccMenuPanel [items]="p.items"></div></div>}
    @else {<div ccMenu [items]="p.items" [label]="p.label ?? ''" [open]="!!p.defaultOpen"></div>}
  </ng-template>
  <ng-template #tButton let-p><button ccButton [variant]="p.variant ?? 'primary'" [size]="p.size" [icon]="p.icon" [loading]="!!p.loading" [done]="!!p.done" [disabled]="!!p.disabled" [attr.aria-label]="p['aria-label'] ?? null">{{ p.children ?? '' }}</button></ng-template>
  <ng-template #tBadge let-p><span ccStatusBadge [label]="p.label" [tone]="p.tone" [appearance]="p.appearance ?? 'filled'" [showIndicator]="p.showIndicator"></span></ng-template>
  <ng-template #tCallout let-p><div ccCallout [tone]="p.tone" [heading]="p.heading" [text]="p.children" [icon]="!!p.icon" [compact]="!!p.compact" [live]="!!p.live" [action]="p.action?.label"></div></ng-template>
  <ng-template #tEmpty let-p><div ccEmptyState [tone]="p.tone" [heading]="p.heading" [text]="p.text" [action]="p.action"></div></ng-template>
  <ng-template #tTimeline let-p><div ccTimeline [items]="p.items" [style]="p.style ?? null"></div></ng-template>
  <ng-template #tSkeleton let-p><div ccSkeleton [loading]="p.loading" [avatar]="p.avatar" [title]="p.title" [subtitle]="p.subtitle" [style]="p.style ?? null"></div></ng-template>
  <ng-template #tStepper let-p><div ccStepper [steps]="p.steps" [current]="p.current" [style]="p.style ?? null"></div></ng-template>
  <ng-template #tCheckbox let-p>
    @if (p.list) {<div ccCheckboxList [items]="p.items" [style]="p.style ?? null"></div>}
    @else {<div ccCheckbox [attr.aria-label]="p['aria-label'] ?? null" [checked]="!!p.checked" [indeterminate]="!!p.indeterminate" [selectAll]="!!p.selectAll" [disabled]="!!p.disabled" [label]="p.label" [style]="p.style ?? null"></div>}
  </ng-template>
  <ng-template #tRadio let-p><div ccRadioGroup [options]="p.options" [value]="p.value" [single]="!!p.single" [style]="p.style ?? null"></div></ng-template>
  <ng-template #tSegmented let-p><div ccSegmented [options]="p.options" [value]="p.value" [size]="p.size ?? 'md'" [style]="p.style ?? null"></div></ng-template>
  <ng-template #tTabs let-p><div ccTabs [tabs]="p.tabs" [value]="p.value" [style]="p.style ?? null"></div></ng-template>
  <ng-template #tDetailTabs let-p><div ccDetailTabs [tabs]="p.tabs" [value]="p.value" [groupStarts]="p.groupStarts ?? []" [label]="p.label" [style]="p.style ?? null"></div></ng-template>
  <ng-template #tStar let-p><span ccStarToggle [on]="p.on" [label]="p.label"></span></ng-template>
  <ng-template #tPagination let-p><div ccPagination [total]="p.total" [page]="p.page" [pageSize]="p.pageSize" [showSize]="p.showSize ?? true" [style]="p.style ?? null"></div></ng-template>
  <ng-template #tTime let-p><div ccTimePicker [value]="p.value" [label]="p.label"></div></ng-template>`,
})
export class Demo {
  /** 有 Angular 外殼的元件（名稱＝shared/cases.ts 的 key；樣板對照在 template 的 refs） */
  private static readonly NAMES = ['switch', 'menu', 'button', 'status-badge', 'callout', 'empty-state', 'timeline', 'skeleton', 'stepper', 'checkbox', 'radio-group', 'segmented', 'tabs', 'detail-tabs', 'star-toggle', 'pagination', 'time-picker'];
  protected readonly list = Demo.NAMES.filter((n) => !only || n === only).map((name) => ({ name, cases: CASES[name] ?? [] }));
  protected interact(c: Case) { return c.interact ? JSON.stringify(c.interact) : null; }
}
