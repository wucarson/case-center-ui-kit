/**
 * 篩選標籤（contracts/filter-chips.json）：目前套用的篩選條件，可逐一移除。
 * 移除鈕寫出條件名稱；移除後焦點移到下一個（最後一個就移到前一個），標籤縮小淡出。
 */
import { cx } from './dom';

export const chipClass = () => cx('chip');
export const chipRemoveLabel = (label: string) => `移除篩選：${label}`;
export const chipsLabel = '目前的篩選條件';
export const withoutAt = <T>(list: T[], i: number) => list.filter((_, k) => k !== i);
/** 移除第 i 個之後，焦點應該落在第幾個移除鈕（沒有了回傳 -1） */
export const chipFocusAfter = (i: number, n: number) => (n <= 1 ? -1 : Math.min(i, n - 2));

/** 移除動畫：縮小淡出（減少動態時略過）；結束後 resolve */
export function chipExit(el: Element | null | undefined): Promise<void> {
  if (!el || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) || !('animate' in el)) return Promise.resolve();
  return (el as HTMLElement).animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(.5)', opacity: 0 }], { duration: 220, easing: 'ease-in', fill: 'forwards' }).finished.then(() => undefined);
}
