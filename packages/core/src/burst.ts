/**
 * 追蹤星號的星光：在 .starb 裡放 8 個小點往外散開後移除（動態同展示牆）。
 * 使用者設定「減少動態」時不播。
 */
export function burst(el: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const svg = el.querySelector('svg');
  svg?.animate([{ transform: 'scale(.3)' }, { transform: 'scale(1.15)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  for (let k = 0; k < 8; k++) {
    const d = document.createElement('i');
    el.append(d);
    const ang = ((360 / 8) * k * Math.PI) / 180;
    d.animate(
      [{ transform: 'none', opacity: 1 }, { transform: `translate(${Math.cos(ang) * 26}px, ${Math.sin(ang) * 26}px) scale(.4)`, opacity: 0 }],
      { duration: 700, easing: 'cubic-bezier(.22,1,.36,1)' },
    ).onfinish = () => d.remove();
  }
}
