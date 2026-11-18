import { Component } from '@angular/core';
import { CASES, type Case } from '../../shared/cases';
import { Menu, MenuPanel, type MenuItem } from './app/menu';
import { Switch } from './app/switch';

type SwitchProps = { 'aria-label'?: string; checked: boolean; label?: string; size?: 'md' | 'sm'; disabled?: boolean; style?: string };
type MenuProps = { items: MenuItem[]; label?: string; inline?: boolean; defaultOpen?: boolean };

const only = new URLSearchParams(location.search).get('c');
const pick = (name: string) => (!only || only === name ? CASES[name] : []);

/** 展示頁：把 shared/cases.ts 的案例用 Angular 元件畫出來，給 tools/compare.mjs 截圖比對（試驗：開關、操作選單） */
@Component({
  selector: 'cc-demo',
  imports: [Switch, Menu, MenuPanel],
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
  </main>`,
})
export class Demo {
  protected readonly switches = pick('switch');
  protected readonly menus = pick('menu');
  protected sw(c: Case) { return c.props as SwitchProps; }
  protected mn(c: Case) { return c.props as MenuProps; }
  protected interact(c: Case) { return c.interact ? JSON.stringify(c.interact) : null; }
}
