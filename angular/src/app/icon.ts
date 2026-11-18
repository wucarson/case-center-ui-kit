import { Directive, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ICONS, ICONS_FILL, type FillIconName, type IconName } from '../../../shared/icons';

/** <svg ccIcon="trash"></svg>：輸出和展示牆相同的 <svg class="ic">；fill＝填滿版（選中時顯示） */
@Directive({
  selector: 'svg[ccIcon]',
  host: { class: 'ic', '[class.fl]': 'fill()', viewBox: '0 0 24 24', 'aria-hidden': 'true', '[innerHTML]': 'html()' },
})
export class Icon {
  readonly name = input.required<IconName>({ alias: 'ccIcon' });
  readonly fill = input(false);
  private readonly sanitizer = inject(DomSanitizer);
  // 圖示是 shared/icons.ts 裡固定的 SVG 路徑（不是使用者輸入），可以略過消毒
  protected readonly html = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.fill() ? ICONS_FILL[this.name() as FillIconName] : ICONS[this.name()]),
  );
}
