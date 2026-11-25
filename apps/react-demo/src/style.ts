import type { CSSProperties } from 'react';

/** 'width:100%;gap:8px' 這種字串轉成 React 的 style 物件（測試案例的外層 style 用） */
export function styleOf(style?: string | CSSProperties): CSSProperties | undefined {
  if (!style || typeof style !== 'string') return style as CSSProperties | undefined;
  return Object.fromEntries(
    style.split(';').filter(Boolean).map((d) => {
      const [k, ...v] = d.split(':');
      return [k.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v.join(':').trim()];
    }),
  );
}
