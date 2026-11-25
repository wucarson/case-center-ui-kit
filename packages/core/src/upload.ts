/**
 * 檔案上傳（contracts/upload.json）：一個附件的上傳進度、完成或失敗；圖示顏色依檔案類型。
 */
import { cx } from './dom';

export type UploadStatus = 'uploading' | 'done' | 'failed';

const TONE: Record<string, string> = {
  pdf: 'var(--danger)',
  fig: 'var(--g3)', sketch: 'var(--g3)', png: 'var(--g3)', jpg: 'var(--g3)', jpeg: 'var(--g3)', svg: 'var(--g3)',
  doc: 'var(--g2)', docx: 'var(--g2)', txt: 'var(--g2)', md: 'var(--g2)',
  xls: 'var(--success)', xlsx: 'var(--success)', csv: 'var(--success)',
};
/** 圖示顏色：依副檔名；其他用主色 */
export const fileTone = (name: string) => TONE[name.split('.').pop()?.toLowerCase() ?? ''] ?? 'var(--primary)';
export const uploadClass = (status: UploadStatus) => cx('up', status === 'done' && 'done', status === 'failed' && 'fail');
/** 進度條寬度（%）：完成一律 100 */
export const uploadWidth = (status: UploadStatus, progress: number) => `${status === 'done' ? 100 : Math.max(0, Math.min(100, progress))}%`;
/** 右側狀態文字：上傳中＝「1.1 / 2.4 MB・45%」（不知道大小只寫 %） */
export function uploadText(status: UploadStatus, progress: number, sizeMB?: number) {
  if (status === 'done') return '上傳完成';
  if (status === 'failed') return '上傳失敗';
  const p = Math.round(progress);
  return sizeMB === undefined ? `${p}%` : `${((sizeMB * progress) / 100).toFixed(1)} / ${sizeMB.toFixed(1)} MB・${p}%`;
}
export const uploadBarLabel = (name: string) => `${name} 上傳進度`;
