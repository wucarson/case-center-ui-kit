/**
 * 搜尋與標籤建議（contracts/tag-search.json）：邊打字邊列出相符的標籤，可直接選建議。
 * ↑↓ 移動、Enter 選取、Esc 收起建議。沒有相符的標籤就不顯示清單（不畫「沒有結果」，下方可能還有標題命中的文章）。
 */
import { cx } from './dom';

export interface TagSuggestion {
  label: string;
  /** 補充，例：「8 篇」 */
  count?: string;
}

/** 相符的標籤：包含輸入字（前後空白不算）；最多 max 個 */
export const tagMatches = (tags: TagSuggestion[], query: string, max = 5) => {
  const q = query.trim();
  return q ? tags.filter((t) => t.label.includes(q)).slice(0, max) : [];
};
export const searchBoxClass = (focus: boolean) => cx('search', focus && 'focus');
/** 建議項：hl＝目前停留（預設第一個） */
export const suggestionClass = (active: boolean) => cx('res', active && 'hl');
export const suggestionListLabel = (label: string) => `${label}的標籤建議`;
export const suggestionId = (inputId: string, i: number) => `${inputId}-opt-${i}`;

export type TagSearchKeyResult = { type: 'move'; index: number } | { type: 'pick'; index: number } | { type: 'close' };
/** 輸入框上的按鍵；不處理的鍵回傳 null */
export function tagSearchKey(open: boolean, cursor: number, count: number, key: string): TagSearchKeyResult | null {
  if (!open || !count) return null;
  if (key === 'ArrowDown' || key === 'ArrowUp') return { type: 'move', index: (cursor + (key === 'ArrowDown' ? 1 : -1) + count) % count };
  if (key === 'Enter' && cursor >= 0 && cursor < count) return { type: 'pick', index: cursor };
  if (key === 'Escape') return { type: 'close' };
  return null;
}
