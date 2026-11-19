/**
 * 數字呈現：統計卡 stat-row、分段統計條 segmented-bar（contracts/ 各一份）。
 */
import { cx } from './dom';

/* ---- 統計卡 stat-row：一列重點數字，數字變動時滾動更新。 ---- */
export interface StatItem {
  label: string;
  value: number | string;
  /** 單位，例：件、小時 */
  unit?: string;
  /** 重點數字（主色） */
  hot?: boolean;
}
export const statClass = (hot?: boolean) => cx('stat', hot && 'hot');
/** 欄數跟著項目數 */
export const statsStyle = (n: number) => ({ '--n': String(n) });

/**
 * 數字滾動：從 from 跑到 to（900ms、先快後慢）。減少動態時直接寫結果。回傳取消函式。
 * 外殼只在「打開 animate」時用；預設直接顯示數字。
 */
export function countUp(el: HTMLElement, from: number, to: number, ms = 900): () => void {
  if (from === to || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)) { el.textContent = String(to); return () => {}; }
  const t0 = performance.now();
  let raf = 0;
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
    el.textContent = String(Math.round(from + (to - from) * e));
    if (k < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

/* ---- 分段統計條 segmented-bar：一條橫條呈現各狀態比例，下方圖例附數量。 ---- */
export interface BarSegment {
  label: string;
  value: number;
  /** 顏色（CSS 值）；沒給依序用預設色 */
  color?: string;
}
export const SEGMENT_COLORS = ['var(--g2)', 'var(--warn)', 'var(--success)', 'var(--line-strong)', 'var(--g3)'];
export const segmentColor = (s: BarSegment, i: number) => s.color ?? SEGMENT_COLORS[i % SEGMENT_COLORS.length];
export const segmentTotal = (segs: BarSegment[]) => segs.reduce((a, s) => a + s.value, 0);
/** 比例條的一段：顏色與比例 */
export const segmentStyle = (s: BarSegment, i: number) => ({ '--c': segmentColor(s, i), '--f': String(s.value) });
export const legendDotStyle = (s: BarSegment, i: number) => ({ '--c': segmentColor(s, i) });
/** 比例條給讀屏的名稱：「進行中 43、待審核 18…」（顏色不是唯一資訊） */
export const segmentBarLabel = (segs: BarSegment[], unit: string) => `共 ${segmentTotal(segs)} ${unit}：${segs.map((s) => `${s.label} ${s.value}`).join('、')}`;
