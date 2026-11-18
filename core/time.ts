/**
 * 時間選擇（contracts/time-picker.json）的共用邏輯。
 * 時、分各自上下調（各自循環，不互相進位）。數值格可聚焦，↑↓ 調整。
 */
export type TimePart = 'h' | 'm';

export const pad2 = (n: number) => String(n).padStart(2, '0');
/** 'HH:mm' → [時, 分] */
export const parseTime = (value: string) => value.split(':').map(Number) as [number, number];
/** 調整後的新值；step＝分鐘每次調整幾分 */
export function timeStep(value: string, part: TimePart, dir: 1 | -1, step = 5): string {
  const [h, m] = parseTime(value);
  const hh = part === 'h' ? h + dir : h, mm = part === 'm' ? m + dir * step : m;
  return `${pad2((hh + 24) % 24)}:${pad2((mm + 60) % 60)}`;
}
/** ↑＝加一、↓＝減一；其他鍵回傳 0 */
export const timeKey = (key: string): 1 | -1 | 0 => (key === 'ArrowUp' ? 1 : key === 'ArrowDown' ? -1 : 0);
export const TIME_COLS = [{ part: 'h', name: '時', max: 23 }, { part: 'm', name: '分', max: 59 }] as const;
