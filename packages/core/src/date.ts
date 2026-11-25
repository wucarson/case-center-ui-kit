/**
 * 日期類的共用邏輯：日期選擇 date-picker、期間選擇 period-picker（contracts/ 各一份）。
 * 日期計算本身在 shared/dates.ts；這裡是鍵盤、class、量位置。
 */
import { PERIODS, addDays, fmtDay, fmtRange, fromISO, periodRange, type PeriodKey } from './dates';
import { cx } from './dom';

/* ---- 日期選擇 date-picker：左側快捷、右側月曆；選了就生效。 ---- */
export type MonthView = [year: number, month: number];
export const viewOf = (iso: string): MonthView => { const d = fromISO(iso); return [d.getFullYear(), d.getMonth()]; };
/** 換月：n＝-1 上個月、1 下個月 */
export const shiftView = ([y, m]: MonthView, n: number): MonthView => { const d = new Date(y, m + n, 1); return [d.getFullYear(), d.getMonth()]; };
export const monthTitle = ([y, m]: MonthView) => `${y} 年 ${m + 1} 月`;
export const dateFieldLabel = (label: string, value: string) => `${label}：${fmtDay(value)}`;
/** 最早可選之前的日期不能選 */
export const canPickDay = (d: string, min?: string) => !(min && d < min);
export const dayClass = (d: string, value: string, today: string, min?: string) =>
  cx(min !== undefined && d < min && 'off', d === today && 'today', d === value && 'on') || undefined;
/** 欄位上的按鍵：Enter、Space、↓ 打開 */
export const isDateOpenKey = (key: string) => key === 'Enter' || key === ' ' || key === 'ArrowDown';

const GRID_STEP: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
export type DateGridKeyResult = { type: 'move'; cursor: string; view: MonthView } | { type: 'pick' } | { type: 'close' };
/** 月曆上的按鍵：←→ 一天、↑↓ 一週（跨月時跟著換月）、Enter 選取、Esc 關閉 */
export function dateGridKey(cursor: string, key: string): DateGridKeyResult | null {
  const step = GRID_STEP[key];
  if (step) { const c = addDays(cursor, step); return { type: 'move', cursor: c, view: viewOf(c) }; }
  if (key === 'Enter') return { type: 'pick' };
  if (key === 'Escape') return { type: 'close' };
  return null;
}
export const MONTH_PREV = '<path d="M15 6l-6 6 6 6"/>';
export const MONTH_NEXT = '<path d="M9 6l6 6-6 6"/>';

/** 選中的圓（.dp-sel）：移到選中日期格的中心（量法同展示牆）；沒有選中日就藏起來 */
export function placeDaySel(grid: Element | null | undefined, sel: HTMLElement | null | undefined) {
  if (!sel) return;
  const on = grid?.querySelector<HTMLElement>('span.on');
  sel.style.display = on ? '' : 'none';
  if (on) sel.style.transform = `translate(${on.offsetLeft + (on.offsetWidth - 32) / 2}px, ${on.offsetTop + (on.offsetHeight - 32) / 2}px)`;
}

/* ---- 期間選擇 period-picker：本月、近 30 天、近 90 天或自訂；範圍以文字寫出。 ---- */
export const periodIndex = (value: PeriodKey) => PERIODS.findIndex((p) => p.key === value);
/** ←→ 換到相鄰項（頭尾相接）；其他鍵回傳 null */
export function periodKey(cur: number, key: string): number | null {
  const d = key === 'ArrowRight' ? 1 : key === 'ArrowLeft' ? -1 : 0;
  return d ? (cur + d + PERIODS.length) % PERIODS.length : null;
}
export const periodText = (value: PeriodKey, today: string, custom?: [string, string]) => fmtRange(periodRange(value, today, custom));

/** 選中片（.ps > i）：移到選中項的位置與寬度（量法同展示牆） */
export function placePeriodPill(ps: Element | null | undefined, pill: HTMLElement | null | undefined) {
  const on = ps?.querySelector<HTMLElement>(':scope > span.on');
  if (on && pill) { pill.style.width = `${on.offsetWidth}px`; pill.style.transform = `translateX(${on.offsetLeft}px)`; }
}
