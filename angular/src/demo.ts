import { Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CASES, type Case } from '../../shared/cases';
import { Button } from './app/button';
import { Callout, EmptyState, Skeleton, StatusBadge, Stepper, Timeline } from './app/display';
import { Menu, MenuPanel, type MenuItem } from './app/menu';
import { Switch } from './app/switch';

type SwitchProps = { 'aria-label'?: string; checked: boolean; label?: string; size?: 'md' | 'sm'; disabled?: boolean; style?: string };
type MenuProps = { items: MenuItem[]; label?: string; inline?: boolean; defaultOpen?: boolean };

const only = new URLSearchParams(location.search).get('c');
const pick = (name: string) => (!only || only === name ? CASES[name] : []);

/** 展示頁：把 shared/cases.ts 的案例用 Angular 元件畫出來，給 tools/compare.mjs 截圖比對 */
@Component({
  selector: 'cc-demo',
  imports: [NgTemplateOutlet, Switch, Menu, MenuPanel, Button, Callout, EmptyState, Skeleton, StatusBadge, Stepper, Timeline],
  host: { style: 'display: block' },
  template: `<main class="cases">
    @for (c of switches; track c.id) {
      <div class="case" data-c="switch" [attr.data-id]="c.id" [attr.data-interact]="interact(c)">
        @let p = sw(c);
        <div ccSwitch [attr.aria-label]="p['aria-label'] ?? null" [checked]="p.checked" [label]="p.label" [size]="p.size ?? 'md'" [disabled]="!!p.disabled" [style]="p.style ?? null"></div>
      </div>
    }
    @for (c of menus; track c.id) {
      <div class="case" data-c="menu" [attr.data-id]="c.id" [attr.data-interact]="interact(c)">
        @let p = mn(c);
        @if (p.inline) {
          <div class="mn pin"><div ccMenuPanel [items]="p.items"></div></div>
        } @else {
          <div ccMenu [items]="p.items" [label]="p.label ?? ''" [open]="!!p.defaultOpen"></div>
        }
      </div>
    }
    @for (c of buttons; track c.id) {
      <div class="case" data-c="button" [attr.data-id]="c.id" [attr.data-interact]="interact(c)">
        @if (c.group) {
          <span [style]="c.wrap">@for (p of c.group; track $index) {<ng-container [ngTemplateOutlet]="btn" [ngTemplateOutletContext]="{ $implicit: p }" />}</span>
        } @else {
          <ng-container [ngTemplateOutlet]="btn" [ngTemplateOutletContext]="{ $implicit: c.props }" />
        }
      </div>
    }
    @for (c of badges; track c.id) {
      <div class="case" data-c="status-badge" [attr.data-id]="c.id" [attr.data-interact]="interact(c)">
        @if (c.group) {
          <span [style]="c.wrap">@for (p of c.group; track $index) {<ng-container [ngTemplateOutlet]="badge" [ngTemplateOutletContext]="{ $implicit: p }" />}</span>
        } @else {
          <ng-container [ngTemplateOutlet]="badge" [ngTemplateOutletContext]="{ $implicit: c.props }" />
        }
      </div>
    }
    @for (c of callouts; track c.id) {
      <div class="case" data-c="callout" [attr.data-id]="c.id" [attr.data-interact]="interact(c)">
        @let p = any(c);
        <div ccCallout [tone]="p.tone" [heading]="p.heading" [text]="p.children" [icon]="!!p.icon" [compact]="!!p.compact" [live]="!!p.live" [action]="p.action?.label"></div>
      </div>
    }
    @for (c of empties; track c.id) {
      <div class="case" data-c="empty-state" [attr.data-id]="c.id" [attr.data-interact]="interact(c)">
        @let p = any(c);
        <div ccEmptyState [tone]="p.tone" [heading]="p.heading" [text]="p.text" [action]="p.action"></div>
      </div>
    }
    @for (c of timelines; track c.id) {
      <div class="case" data-c="timeline" [attr.data-id]="c.id" [attr.data-interact]="interact(c)">
        @let p = any(c);
        <div ccTimeline [items]="p.items" [style]="p.style ?? null"></div>
      </div>
    }
    @for (c of skeletons; track c.id) {
      <div class="case" data-c="skeleton" [attr.data-id]="c.id" [attr.data-interact]="interact(c)">
        @let p = any(c);
        <div ccSkeleton [loading]="p.loading" [avatar]="p.avatar" [title]="p.title" [subtitle]="p.subtitle" [style]="p.style ?? null"></div>
      </div>
    }
    @for (c of steppers; track c.id) {
      <div class="case" data-c="stepper" [attr.data-id]="c.id" [attr.data-interact]="interact(c)">
        @let p = any(c);
        <div ccStepper [steps]="p.steps" [current]="p.current" [style]="p.style ?? null"></div>
      </div>
    }
  </main>
  <ng-template #btn let-p><button ccButton [variant]="p.variant ?? 'primary'" [size]="p.size" [icon]="p.icon" [loading]="!!p.loading" [done]="!!p.done" [disabled]="!!p.disabled" [attr.aria-label]="p['aria-label'] ?? null">{{ p.children ?? '' }}</button></ng-template>
  <ng-template #badge let-p><span ccStatusBadge [label]="p.label" [tone]="p.tone" [appearance]="p.appearance ?? 'filled'" [showIndicator]="p.showIndicator"></span></ng-template>`,
})
export class Demo {
  protected readonly switches = pick('switch');
  protected readonly menus = pick('menu');
  protected readonly buttons = pick('button');
  protected readonly badges = pick('status-badge');
  protected readonly callouts = pick('callout');
  protected readonly empties = pick('empty-state');
  protected readonly timelines = pick('timeline');
  protected readonly skeletons = pick('skeleton');
  protected readonly steppers = pick('stepper');
  protected sw(c: Case) { return c.props as SwitchProps; }
  protected mn(c: Case) { return c.props as MenuProps; }
  // 案例資料是共用的示意資料（Record<string, unknown>），展示頁直接當成元件參數
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected any(c: Case): any { return c.props; }
  protected interact(c: Case) { return c.interact ? JSON.stringify(c.interact) : null; }
}
