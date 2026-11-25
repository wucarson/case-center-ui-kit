/**
 * 分頁要顯示的頁碼：7 頁以內全部列出；超過時頭尾固定、目前頁前後各一頁，其餘收成 …（null）。
 * 例：pageItems(6, 12) → [1, null, 5, 6, 7, null, 12]
 */
export function pageItems(page: number, pages: number): (number | null)[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const from = Math.max(2, Math.min(page - 1, pages - 3)), to = Math.min(pages - 1, Math.max(page + 1, 4));
  const mid = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  return [1, ...(from > 2 ? [null] : []), ...mid, ...(to < pages - 1 ? [null] : []), pages];
}
