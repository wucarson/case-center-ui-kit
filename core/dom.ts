/**
 * 共用邏輯的 DOM 小工具：不依賴任何框架，React、Vue、Angular 外殼都從這裡取用。
 */

/** 組 class：略過 false／空字串 */
export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/** 元素是否為鍵盤聚焦（:focus-visible）：焦點框畫在子元素上的元件用（開關的軌道、核取方塊的方框） */
export const isFocusVisible = (el: Element) => el.matches(':focus-visible');

/** 在 root 以外按下滑鼠時呼叫 cb；回傳解除監聽的函式 */
export function onOutsidePointer(root: Element, cb: () => void): () => void {
  const off = (e: MouseEvent) => { if (!root.contains(e.target as Node)) cb(); };
  document.addEventListener('mousedown', off);
  return () => document.removeEventListener('mousedown', off);
}
