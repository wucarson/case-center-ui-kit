import type { CSSProperties } from 'react';
import { cx, styleOf } from './util';

export interface SkeletonProps {
  /** 載入中顯示骨架；false 時骨架淡出、內容淡入 */
  loading: boolean;
  /** 頭像：字與分類色 1–4 */
  avatar: { initial: string; color: 1 | 2 | 3 | 4 };
  title: string;
  subtitle?: string;
  className?: string;
  style?: string | CSSProperties;
}

/** 骨架載入（人員列）：骨架形狀照實際內容，載入後不跳動。 */
export function Skeleton({ loading, avatar, title, subtitle, className, style }: SkeletonProps) {
  return (
    <div className={cx('sk', !loading && 'loaded', className)} style={styleOf(style)} aria-busy={loading}>
      <div className="ghost" aria-hidden="true"><span className="av shim" /><span className="ls"><b className="shim" /><b className="shim" /></span></div>
      <div className="real" aria-hidden={loading}><span className="av" style={{ background: `var(--cat${avatar.color})` }}>{avatar.initial}</span><div><p>{title}</p><small>{subtitle}</small></div></div>
    </div>
  );
}
