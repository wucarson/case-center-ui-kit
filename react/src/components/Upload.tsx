import type { CSSProperties } from 'react';
import { fileTone, uploadBarLabel, uploadClass, uploadText, uploadWidth, type UploadStatus } from '../../../core/upload';
import { cx, styleOf } from './util';

export type { UploadStatus };

export interface UploadProps {
  /** 檔名（含副檔名，圖示顏色依副檔名） */
  name: string;
  status: UploadStatus;
  /** 上傳進度 0–100 */
  progress?: number;
  /** 檔案大小（MB）：給了就寫「1.1 / 2.4 MB・45%」 */
  size?: number;
  className?: string;
  style?: string | CSSProperties;
}

const FILE = '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>';

/** 檔案上傳：一個附件的進度、完成或失敗；圖示顏色依檔案類型。規則在 core/upload.ts。 */
export function Upload({ name, status, progress = 0, size, className, style }: UploadProps) {
  const pct = uploadWidth(status, progress);
  return (
    <div className={cx(uploadClass(status), className)} style={styleOf(style)}>
      <span className="up-i" style={{ '--tone': fileTone(name) } as CSSProperties}><svg className="ic" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: FILE }} /></span>
      <div className="up-m">
        <div className="up-r"><span className="roll nm"><span>{name}</span></span><span className="st num" aria-live="polite">{uploadText(status, progress, size)}</span></div>
        <div className="up-b" role="progressbar" aria-label={uploadBarLabel(name)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={parseFloat(pct)}><i style={{ width: pct }} /></div>
      </div>
    </div>
  );
}
