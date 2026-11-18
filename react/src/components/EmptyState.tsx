import type { CSSProperties } from 'react';
import type { IconName } from '../../../shared/icons';
import { Button } from './Button';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export type EmptyTone = 'info' | 'warn' | 'danger';
const ICON: Record<EmptyTone, IconName> = { info: 'emptyList', warn: 'noResult', danger: 'failed' };

export interface EmptyStateProps {
  /** info＝還沒有內容；warn＝篩選後查無結果；danger＝載入失敗 */
  tone: EmptyTone;
  heading: string;
  /** 說明下一步 */
  text: string;
  /** 下一步的按鈕文字，例：「新增工單」「清除篩選」「重試」 */
  action?: string;
  onAction?: () => void;
  className?: string;
  style?: string | CSSProperties;
}

/** 空狀態：沒有內容、查無結果或載入失敗時，說明原因並給下一步。 */
export function EmptyState({ tone, heading, text, action, onAction, className, style }: EmptyStateProps) {
  return (
    <div className={cx('es', tone, className)} style={styleOf(style)} role={tone === 'danger' ? 'alert' : 'status'}>
      <span className="es-m"><Icon name={ICON[tone]} /></span>
      <b>{heading}</b>
      <p>{text}</p>
      {action && <Button variant="outline" onClick={onAction}>{action}</Button>}
    </div>
  );
}
