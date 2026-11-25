/**
 * 日期小工具（日期選擇、期間選擇共用；React、Vue 都用這份，算出來的文字與日期一致）。
 * 日期一律用本地時間的 'YYYY-MM-DD' 字串，避免時區位移。
 */
export const WEEK = '日一二三四五六';
const pad = (n: number) => String(n).padStart(2, '0');

export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (s: string, n: number) => { const d = fromISO(s); d.setDate(d.getDate() + n); return toISO(d); };
export const todayISO = () => toISO(new Date());
/** 2026-11-20（五） */
export const fmtDay = (s: string) => `${s}（${WEEK[fromISO(s).getDay()]}）`;
export const endOfMonth = (s: string) => { const d = fromISO(s); return toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0)); };
export const startOfMonth = (s: string) => { const d = fromISO(s); return toISO(new Date(d.getFullYear(), d.getMonth(), 1)); };
/** 起訖都算，共幾天 */
export const daysBetween = (a: string, b: string) => Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86400000) + 1;

/** 日期選擇的快捷：今天、明天、一週後、月底 */
export const PRESETS = (today: string) => [
  { label: '今天', value: today },
  { label: '明天', value: addDays(today, 1) },
  { label: '一週後', value: addDays(today, 7) },
  { label: '月底', value: endOfMonth(today) },
];

/** 某月的格子：前面補空格到星期日起算，之後是 1…月底 */
export function monthCells(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1).getDay();
  const last = new Date(year, month + 1, 0).getDate();
  return [...Array(first).fill(null), ...Array.from({ length: last }, (_, i) => toISO(new Date(year, month, i + 1)))];
}

/** 期間選擇 */
export type PeriodKey = 'month' | '30d' | '90d' | 'custom';
export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'month', label: '本月' },
  { key: '30d', label: '近 30 天' },
  { key: '90d', label: '近 90 天' },
  { key: 'custom', label: '自訂' },
];
export function periodRange(key: PeriodKey, today: string, custom?: [string, string]): [string, string] {
  if (key === 'month') return [startOfMonth(today), today];
  if (key === '30d') return [addDays(today, -29), today];
  if (key === '90d') return [addDays(today, -89), today];
  return custom ?? [today, today];
}
/** 2026-11-01 ～ 2026-11-13・共 13 天 */
export const fmtRange = ([a, b]: [string, string]) => `${a} ～ ${b}・共 ${daysBetween(a, b)} 天`;
