import { Component, ElementRef, afterRenderEffect, computed, input, linkedSignal, model, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { cx, isActivateKey } from '../../../core/dom';
import {
  SIDEBAR_CHEVRON, placeSidebarIndicator, sidebarBrandLabel, sidebarClass, sidebarGroupToggleClass, sidebarHasActive, sidebarInitialOpen,
  sidebarItemClass, sidebarSubClass, sidebarTipTop, toggleAt, type SidebarGroup, type SidebarItem,
} from '../../../core/sidebar';
import { Icon, SvgPath } from './icon';

export type { SidebarGroup, SidebarItem };

/**
 * 側邊選單：選中＝淡主色底＋填滿圖示，選中片彈性滑動；群組可收合；可收合成圖示列（滑過顯示名稱）。
 *   <div ccSidebar [groups]="nav" [(value)]="page" [(collapsed)]="mini" collapsible [brand]="{ logo: '案', name: '案管中心' }"></div>
 */
@Component({
  selector: '[ccSidebar]',
  imports: [Icon, NgTemplateOutlet, SvgPath],
  host: { '[class]': 'cls()' },
  template: `<ng-template #item let-it><span [class]="itemCls(it)" role="link" tabindex="0" [attr.aria-current]="it.key === value() ? 'page' : null" (click)="value.set(it.key)" (keydown)="onKey($event, it.key)" (mouseenter)="showTip($event, it.label)" (mouseleave)="tip.set(null)"><svg [ccIcon]="it.icon" class="ln"></svg><svg [ccIcon]="it.icon" [fill]="true"></svg><span>{{ it.label }}</span>@if (it.count != null) {<b>{{ it.count }}</b>}</span></ng-template><nav class="sd" [attr.aria-label]="ariaLabel() ?? null">@if (brand(); as b) {<div class="sd-brand" [attr.role]="collapsible() ? 'button' : null" [attr.tabindex]="collapsible() ? 0 : null" [attr.aria-label]="collapsible() ? brandLabel() : null" [attr.aria-expanded]="collapsible() ? !collapsed() : null" (click)="fold()" (keydown)="onBrandKey($event)"><i class="sd-logo">{{ b.logo }}</i><b>{{ b.name }}</b></div>}<div #list class="sd-list">@if (has()) {<i #ind class="sd-ind" aria-hidden="true"></i>}@for (g of groups(); track $index; let k = $index) {@if (g.collapsible) {<span [class]="toggleCls(k)" role="button" tabindex="0" [attr.aria-expanded]="open()[k]" (click)="toggle(k)" (keydown)="onToggleKey($event, k)">{{ g.label }}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" [ccPath]="chevron"></svg></span><div [class]="subCls(k)"><div>@for (it of g.items; track it.key) {<ng-container *ngTemplateOutlet="item; context: { $implicit: it }" />}</div></div>} @else {<span class="sd-g">{{ g.label }}</span>@for (it of g.items; track it.key) {<ng-container *ngTemplateOutlet="item; context: { $implicit: it }" />}}}</div>@if (user(); as u) {<div class="sd-me"><i class="av">{{ u.initial }}</i><span>{{ u.name }}</span></div>}</nav>@if (collapsed()) {<span [class]="tipCls()" [style.top.px]="tip()?.top ?? null" aria-hidden="true">{{ tip()?.text }}</span>}`,
})
export class Sidebar {
  readonly groups = input.required<SidebarGroup[]>();
  /** 目前頁的 key */
  readonly value = model<string>();
  /** 收合成圖示列 */
  readonly collapsed = model(false);
  /** 點品牌列切換收合 */
  readonly collapsible = input(false);
  readonly brand = input<{ logo: string; name: string }>();
  readonly user = input<{ name: string; initial: string }>();
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });

  protected readonly chevron = SIDEBAR_CHEVRON;
  /** 各群組是否展開（換 groups 時重設） */
  protected readonly open = linkedSignal(() => sidebarInitialOpen(this.groups()));
  protected readonly tip = signal<{ text: string; top: number } | null>(null);
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');
  private readonly ind = viewChild<ElementRef<HTMLElement>>('ind');
  protected readonly cls = computed(() => sidebarClass(this.collapsed()));
  protected readonly has = computed(() => sidebarHasActive(this.groups(), this.value()));
  protected readonly brandLabel = computed(() => sidebarBrandLabel(this.collapsed()));
  protected readonly tipCls = computed(() => cx('sd-tip', !!this.tip() && 'show'));
  protected itemCls(it: SidebarItem) { return sidebarItemClass(it.key === this.value()); }
  protected toggleCls(k: number) { return sidebarGroupToggleClass(this.isOpen(k)); }
  protected subCls(k: number) { return sidebarSubClass(this.isOpen(k)); }
  private isOpen(k: number) { return this.open()[k]; }

  constructor() {
    // 選中片：量選中項目的位置（量法同展示牆）
    afterRenderEffect(() => { this.value(); this.collapsed(); this.open(); placeSidebarIndicator(this.list().nativeElement, this.ind()?.nativeElement); });
  }

  protected toggle(k: number) { this.open.set(toggleAt(this.open(), k)); }
  protected fold() { if (this.collapsible()) this.collapsed.set(!this.collapsed()); }
  protected showTip(e: MouseEvent, text: string) { if (this.collapsed()) this.tip.set({ text, top: sidebarTipTop(this.list().nativeElement, e.currentTarget as HTMLElement) }); }
  protected onKey(e: KeyboardEvent, key: string) { if (isActivateKey(e.key)) { e.preventDefault(); this.value.set(key); } }
  protected onToggleKey(e: KeyboardEvent, k: number) { if (isActivateKey(e.key)) { e.preventDefault(); this.toggle(k); } }
  protected onBrandKey(e: KeyboardEvent) { if (isActivateKey(e.key)) { e.preventDefault(); this.fold(); } }
}
