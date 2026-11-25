import { useCallback, useState, type CSSProperties, type FocusEvent } from 'react';

/** 組 class：略過 false／空字串 */
export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/** 'width:100%;gap:8px' 這種字串轉成 React 的 style 物件（展示頁照抄樣本的 style 用） */
export function styleOf(style?: string | CSSProperties): CSSProperties | undefined {
  if (!style || typeof style !== 'string') return style as CSSProperties | undefined;
  return Object.fromEntries(
    style.split(';').filter(Boolean).map((d) => {
      const [k, ...v] = d.split(':');
      return [k.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v.join(':').trim()];
    }),
  );
}

/**
 * 鍵盤聚焦（:focus-visible）時才回傳 true：給「焦點框畫在子元素上」的元件用
 * （核取方塊的方框、開關的軌道），樣式沿用 components.css 的 .is-focus。
 */
export function useFocusVisible() {
  const [on, setOn] = useState(false);
  const onFocus = useCallback((e: FocusEvent<HTMLElement>) => setOn(e.currentTarget.matches(':focus-visible')), []);
  const onBlur = useCallback(() => setOn(false), []);
  return { focusVisible: on, focusProps: { onFocus, onBlur } };
}
