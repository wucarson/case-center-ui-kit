import { useState, type CSSProperties } from 'react';
import { cx, styleOf } from './util';

export interface AvatarPerson {
  name: string;
  /** 頭像上的字，通常是姓 */
  initial: string;
  /** 分類色 1–4（--cat1…--cat4） */
  color: 1 | 2 | 3 | 4;
}

export interface AvatarGroupProps {
  people: AvatarPerson[];
  /** 最多顯示幾位，其餘收成 +N（預設 3） */
  max?: number;
  className?: string;
  style?: string | CSSProperties;
}

/** 成員頭像群組：重疊排列，滑過時展開；超過 max 收成 +N，右邊寫總人數。 */
export function AvatarGroup({ people, max = 3, className, style }: AvatarGroupProps) {
  const [spread, setSpread] = useState(false);
  const shown = people.slice(0, max), rest = people.length - shown.length;
  return (
    <div className={cx('ppl-r', className)} style={styleOf(style)}>
      <div className={cx('stack', spread && 'spread')} role="list" aria-label={people.map((p) => p.name).join('、')} onMouseEnter={() => setSpread(true)} onMouseLeave={() => setSpread(false)}>
        {shown.map((p) => <span key={p.name} className="av" style={{ '--a': `var(--cat${p.color})` } as CSSProperties} role="listitem" title={p.name}>{p.initial}</span>)}
        {rest > 0 && <span className="av more" role="listitem" title={people.slice(max).map((p) => p.name).join('、')}>{`+${rest}`}</span>}
      </div>
      <span className="ppl-c">{`共 ${people.length} 位`}</span>
    </div>
  );
}
