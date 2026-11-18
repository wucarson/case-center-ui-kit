import type { CSSProperties } from 'react';
import type { IconName } from '../../../shared/icons';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export type TimelineType = 'edit' | 'done' | 'due';
const CLS: Record<TimelineType, string> = { edit: 'a', done: 'b', due: 'c' };
const ICON: Record<TimelineType, IconName> = { edit: 'edit', done: 'check', due: 'due' };

export interface TimelineItem {
  /** edit＝變更、新增；done＝完成、通過；due＝時間、期限相關 */
  type: TimelineType;
  /** 人名＋動作，例：「李小美 變更狀態為「進行中」」 */
  text: string;
  /** 相對時間，例：「剛剛」「2 分鐘前」 */
  time: string;
}

export interface TimelineProps {
  /** 最新的放最前面 */
  items: TimelineItem[];
  'aria-label'?: string;
  className?: string;
  style?: string | CSSProperties;
}

/** 歷程：最新的在最上面；每筆是圖示＋人名動作＋相對時間。 */
export function Timeline({ items, className, style, ...aria }: TimelineProps) {
  return (
    <div className={cx('nts', className)} style={styleOf(style)} role="list" aria-label={aria['aria-label']}>
      {items.map((it, k) => (
        <div key={k} className="nt" role="listitem">
          <i className={CLS[it.type]} aria-hidden="true"><Icon name={ICON[it.type]} /></i>
          <div><p>{it.text}</p><small>{it.time}</small></div>
        </div>
      ))}
    </div>
  );
}
