import { Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CASES, type Case } from '../../shared/cases';
import { Button } from '@wucarson/facet-angular';
import { Checkbox, CheckboxList, RadioGroup, Segmented, StarToggle } from '@wucarson/facet-angular';
import { Callout, EmptyState, Skeleton, StatusBadge, Stepper, Timeline } from '@wucarson/facet-angular';
import { Menu, MenuPanel } from '@wucarson/facet-angular';
import { Pagination } from '@wucarson/facet-angular';
import { Switch } from '@wucarson/facet-angular';
import { DetailTabs, Tabs } from '@wucarson/facet-angular';
import { TimePicker } from '@wucarson/facet-angular';
import { DatePicker, PeriodPicker } from '@wucarson/facet-angular';
import { AvatarGroup } from '@wucarson/facet-angular';
import { FieldControl, FormField } from '@wucarson/facet-angular';
import { Combo, MultiSelect } from '@wucarson/facet-angular';
import { ConfirmDialog, InfoPopover, Toast } from '@wucarson/facet-angular';
import { Sidebar } from '@wucarson/facet-angular';
import { HoldConfirm } from '@wucarson/facet-angular';
import { FilterChips, SegmentedBar, StatRow, Upload } from '@wucarson/facet-angular';
import { TagSearch } from '@wucarson/facet-angular';
import { DragSort } from '@wucarson/facet-angular';
import { DataTable, DueCell, SortTh } from '@wucarson/facet-angular';
import { fieldCount } from '@wucarson/facet-core/field';
import { Icon } from '@wucarson/facet-angular';

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
    AvatarGroup, Combo, ConfirmDialog, DatePicker, FieldControl, FormField, Icon, InfoPopover, MultiSelect, PeriodPicker, Sidebar, Toast,
    DragSort, FilterChips, HoldConfirm, SegmentedBar, StatRow, TagSearch, Upload, DataTable, DueCell, SortTh,
  ],
  host: { style: 'display: block' },
  template: `@let refs = { switch: tSwitch, menu: tMenu, button: tButton, 'status-badge': tBadge, callout: tCallout, 'empty-state': tEmpty, timeline: tTimeline, skeleton: tSkeleton, stepper: tStepper, checkbox: tCheckbox, 'radio-group': tRadio, segmented: tSegmented, tabs: tTabs, 'detail-tabs': tDetailTabs, 'star-toggle': tStar, pagination: tPagination, 'time-picker': tTime, 'form-field': tField, combo: tCombo, 'multi-select': tMulti, dialog: tDialog, toast: tToast, 'info-popover': tPopover, 'date-picker': tDate, 'period-picker': tPeriod, sidebar: tSidebar, 'avatar-group': tAvatar, 'tag-search': tTagSearch, 'hold-to-confirm': tHold, 'drag-sort': tDrag, upload: tUpload, 'filter-chips': tChips, 'stat-row': tStat, 'segmented-bar': tSeg, 'data-table': tTable };
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
  <ng-template #tSegmented let-p><div ccSegmented [disabled]="!!p.disabled" [options]="p.options" [value]="p.value" [size]="p.size ?? 'md'" [style]="p.style ?? null"></div></ng-template>
  <ng-template #tTabs let-p><div ccTabs [tabs]="p.tabs" [value]="p.value" [style]="p.style ?? null"></div></ng-template>
  <ng-template #tDetailTabs let-p><div ccDetailTabs [tabs]="p.tabs" [value]="p.value" [groupStarts]="p.groupStarts ?? []" [label]="p.label" [style]="p.style ?? null"></div></ng-template>
  <ng-template #tStar let-p><span ccStarToggle [on]="p.on" [label]="p.label"></span></ng-template>
  <ng-template #tPagination let-p><div ccPagination [total]="p.total" [page]="p.page" [pageSize]="p.pageSize" [showSize]="p.showSize ?? true" [style]="p.style ?? null"></div></ng-template>
  <ng-template #tTime let-p><div ccTimePicker [disabled]="!!p.disabled" [value]="p.value" [label]="p.label"></div></ng-template>
  <ng-template #tField let-p>@let fid = fieldId(p);<div ccFormField [label]="p.label" [required]="!!p.required" [optional]="!!p.optional" [readOnly]="!!p.readOnly" [disabled]="!!p.disabled" [empty]="!!p.empty" [help]="p.help" [error]="p.error" [multiline]="!!p.multiline" [counter]="count(p)" [htmlFor]="fid">@if (p.prefix) {<svg [ccIcon]="p.prefix"></svg>}@if (p.multiline) {<textarea ccFieldControl [id]="fid" [value]="p.value" [attr.placeholder]="p.placeholder ?? null" [attr.maxlength]="p.maxLength ?? null"></textarea>} @else {<input ccFieldControl [id]="fid" [value]="p.value" [attr.placeholder]="p.placeholder ?? null" [attr.maxlength]="p.maxLength ?? null" />}@if (p.suffix) {<span class="unit">{{ p.suffix }}</span>}@if (p.readOnly) {<svg ccIcon="lock"></svg>}</div></ng-template>
  <ng-template #tCombo let-p>
    @if (p.field) {<div ccFormField [label]="p.field.label" [required]="!!p.field.required" [error]="p.field.error"><div ccCombo [items]="p.items" [value]="p.value ?? ''" [label]="p.label" [placeholder]="p.placeholder" [invalid]="!!p.invalid"></div></div>}
    @else {<div ccCombo [disabled]="!!p.disabled" [items]="p.items" [value]="p.value ?? ''" [label]="p.label" [placeholder]="p.placeholder" [selfLabelled]="!!p.selfLabelled" [invalid]="!!p.invalid" [inlineMenu]="!!p.inlineMenu" [open]="!!p.defaultOpen" [defaultQuery]="p.defaultQuery"></div>}
  </ng-template>
  <ng-template #tMulti let-p>
    @if (p.field) {<div ccFormField [label]="p.field.label"><div ccMultiSelect [options]="p.options" [value]="p.value" [noun]="p.noun"></div></div>}
    @else {<div ccMultiSelect [disabled]="!!p.disabled" [options]="p.options" [value]="p.value" [noun]="p.noun" [single]="!!p.single" [inlineMenu]="!!p.inlineMenu" [open]="!!p.defaultOpen" [defaultQuery]="p.defaultQuery"></div>}
  </ng-template>
  <ng-template #tDialog let-p><div ccConfirmDialog [open]="p.open" [inline]="!!p.inline" [title]="p.title" [body]="p.body" [note]="p.note" [destructive]="!!p.destructive"></div></ng-template>
  <ng-template #tToast let-p><div ccToast [title]="p.title" [detail]="p.detail" [tone]="p.tone ?? 'ok'" [action]="p.action"></div></ng-template>
  <ng-template #tPopover let-p><div ccInfoPopover [label]="p.label" [value]="p.value" [valueNote]="p.valueNote" [defaultOpen]="!!p.defaultOpen" [openDelay]="p.openDelay ?? 150">{{ p.children }}</div></ng-template>
  <ng-template #tDate let-p><div ccDatePicker [disabled]="!!p.disabled" [value]="p.value" [label]="p.label" [help]="p.help" [min]="p.min" [today]="p.today" [open]="!!p.defaultOpen"></div></ng-template>
  <ng-template #tPeriod let-p><div ccPeriodPicker [disabled]="!!p.disabled" [value]="p.value" [today]="p.today" [custom]="p.custom" [style]="p.style ?? null"></div></ng-template>
  <ng-template #tSidebar let-p><div ccSidebar [groups]="p.groups" [value]="p.value" [collapsed]="!!p.collapsed" [brand]="p.brand" [user]="p.user"></div></ng-template>
  <ng-template #tAvatar let-p><div ccAvatarGroup [people]="p.people"></div></ng-template>
  <ng-template #tTagSearch let-p><div ccTagSearch [disabled]="!!p.disabled" [tags]="p.tags" [value]="p.value" [label]="p.label"></div></ng-template>
  <ng-template #tHold let-p><div ccHoldConfirm [label]="p.label" [progress]="p.progress" [done]="!!p.done" [disabled]="!!p.disabled"></div></ng-template>
  <ng-template #tDrag let-p><div ccDragSort [items]="p.items"></div></ng-template>
  <ng-template #tUpload let-p><div ccUpload [name]="p.name" [status]="p.status" [progress]="p.progress ?? 0" [size]="p.size"></div></ng-template>
  <ng-template #tChips let-p><div ccFilterChips [items]="p.items"></div></ng-template>
  <ng-template #tStat let-p><div ccStatRow [items]="p.items"></div></ng-template>
  <ng-template #tSeg let-p><div ccSegmentedBar [segments]="p.segments" [unit]="p.unit"></div></ng-template>
  <ng-template #tTable let-p>@if (p.columns) {<div ccDataTable [label]="p.label" [columns]="p.columns" [rows]="p.rows" [sort]="p.sort ?? { key: null, dir: 'asc' }" [cols]="p.cols" [header]="p.header ?? true" [today]="p.today" [style]="p.style ?? null"></div>} @else if (p.state) {<span ccSortTh [label]="p.label" [state]="p.state"></span>} @else {<span ccDueCell [due]="p.due" [today]="p.today" [closed]="!!p.closed"></span>}</ng-template>`,
})
export class Demo {
  /** 有 Angular 外殼的元件（名稱＝shared/cases.ts 的 key；樣板對照在 template 的 refs） */
  private static readonly NAMES = ['switch', 'menu', 'button', 'status-badge', 'callout', 'empty-state', 'timeline', 'skeleton', 'stepper', 'checkbox', 'radio-group', 'segmented', 'tabs', 'detail-tabs', 'star-toggle', 'pagination', 'time-picker', 'form-field', 'combo', 'multi-select', 'dialog', 'toast', 'info-popover', 'date-picker', 'period-picker', 'sidebar', 'avatar-group', 'tag-search', 'hold-to-confirm', 'drag-sort', 'upload', 'filter-chips', 'stat-row', 'segmented-bar', 'data-table'];
  protected readonly list = Demo.NAMES.filter((n) => !only || n === only).map((name) => ({ name, cases: CASES[name] ?? [] }));
  protected interact(c: Case) { return c.interact ? JSON.stringify(c.interact) : null; }
  /** 文字欄位：每個案例一個固定的輸入框 id */
  private readonly ids = new WeakMap<object, string>();
  protected fieldId(p: object) { if (!this.ids.has(p)) this.ids.set(p, `f-${Math.random().toString(36).slice(2, 8)}`); return this.ids.get(p)!; }
  protected count(p: any) { return fieldCount(p.value, p.maxLength, p.showCount, p.counter); }
}
