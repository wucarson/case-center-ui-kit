/**
 * 頁籤、詳情頁籤（contracts/tabs.json、detail-tabs.json）的共用邏輯。
 * 左右鍵切換（循環）、Home／End 跳頭尾；選中項才能 Tab 進來。
 */
import { cx } from './dom';

/** 按鍵後要選的索引；不處理的鍵回傳 -1 */
export function tabsKey(key: string, i: number, n: number): number {
  if (key === 'ArrowRight') return (i + 1) % n;
  if (key === 'ArrowLeft') return (i - 1 + n) % n;
  if (key === 'Home') return 0;
  if (key === 'End') return n - 1;
  return -1;
}

export const tabClass = (on: boolean) => cx('tab', on && 'on');
export const detailTabClass = (on: boolean) => cx('dtab', on && 'on');

export interface DetailTabLabel { label: string; srCount?: string }
/** 數量的意思不明顯時，讀屏念「名稱，說法」 */
export const detailTabAriaLabel = (t: DetailTabLabel) => (t.srCount ? `${t.label}，${t.srCount}` : null);
/** 從 groupStarts 的 key 開始新的一組，前面畫分隔線（第一個不畫） */
export const detailTabSeparator = (i: number, key: string, groupStarts: string[] = []) => i > 0 && groupStarts.includes(key);
