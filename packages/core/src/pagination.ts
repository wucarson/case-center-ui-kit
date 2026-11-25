/**
 * 分頁（contracts/pagination.json）的共用邏輯。
 * 頁數多時頭尾固定、中間收成 …；第一頁停用「‹」、最後一頁停用「›」。Enter／Space 換頁。
 */
export { pageItems } from './pages';

export const pageCount = (total: number, pageSize: number) => Math.max(1, Math.ceil(total / pageSize));
/** 要換到的頁；超出範圍或就是目前頁回傳 null */
export const pageTarget = (p: number, page: number, pages: number) => (p >= 1 && p <= pages && p !== page ? p : null);
export const isPageKey = (key: string) => key === 'Enter' || key === ' ';
/** 上一頁（-1）／下一頁（1）是否停用 */
export const pageArrowOff = (dir: -1 | 1, page: number, pages: number) => (dir < 0 ? page <= 1 : page >= pages);
export const PAGE_ARROW = { [-1]: { text: '‹', label: '上一頁' }, [1]: { text: '›', label: '下一頁' } } as const;
export const pageLabel = (p: number) => `第 ${p} 頁`;
