import { useEffect, useRef, type CSSProperties } from 'react';
import {
  countUp, legendDotStyle, segmentBarLabel, segmentStyle, segmentTotal, statClass, statsStyle, type BarSegment, type StatItem,
} from '@wucarson/facet-core/metrics';
import { cx, styleOf } from './util';

export type { BarSegment, StatItem };

/** 數字：animate 時換值會從舊值滾到新值 */
function Num({ value, animate }: { value: number | string; animate?: boolean }) {
  const el = useRef<HTMLElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current; prev.current = value;
    if (animate && el.current && typeof value === 'number' && typeof from === 'number') return countUp(el.current, from, value);
  }, [value, animate]);
  return <b ref={el} className="num">{value}</b>;
}

export interface StatRowProps {
  /** 2–4 個重點數字 */
  items: StatItem[];
  /** 數字變動時滾動更新 */
  animate?: boolean;
  className?: string;
  style?: string | CSSProperties;
}

/** 統計卡：一列重點數字；第一個常設為重點（hot，主色）。規則在 core/metrics.ts。 */
export function StatRow({ items, animate, className, style }: StatRowProps) {
  return (
    <div className={cx('stats', className)} role="list" style={{ ...(statsStyle(items.length) as CSSProperties), ...(styleOf(style) ?? {}) }}>
      {items.map((s) => (
        <div key={s.label} className={statClass(s.hot)} role="listitem">
          <span>{s.label}</span><Num value={s.value} animate={animate} />{s.unit && <small>{s.unit}</small>}
        </div>
      ))}
    </div>
  );
}

export interface SegmentedBarProps {
  segments: BarSegment[];
  /** 總數後的單位，例：「件工單」 */
  unit?: string;
  animate?: boolean;
  className?: string;
  style?: string | CSSProperties;
}

/** 分段統計條：總數＋比例條＋圖例數字（顏色不是唯一資訊）。規則在 core/metrics.ts。 */
export function SegmentedBar({ segments, unit = '件', animate, className, style }: SegmentedBarProps) {
  return (
    <div className={cx('sb', className)} style={styleOf(style)}>
      <div className="sb-h"><Num value={segmentTotal(segments)} animate={animate} /><span>{unit}</span></div>
      <div className="sb-b" role="img" aria-label={segmentBarLabel(segments, unit)}>
        {segments.map((s, i) => <i key={s.label} style={segmentStyle(s, i) as CSSProperties} />)}
      </div>
      <div className="sb-l">
        {segments.map((s, i) => <span key={s.label}><i style={legendDotStyle(s, i) as CSSProperties} />{s.label}<Num value={s.value} animate={animate} /></span>)}
      </div>
    </div>
  );
}
