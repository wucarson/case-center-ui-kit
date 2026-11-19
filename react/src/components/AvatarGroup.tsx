import { useState, type CSSProperties } from 'react';
import { avatarNames, avatarRest, avatarShown, avatarStackClass, avatarStyle, avatarTotal, type AvatarPerson } from '../../../core/display';
import { cx, styleOf } from './util';

export type { AvatarPerson };

export interface AvatarGroupProps {
  people: AvatarPerson[];
  /** 最多顯示幾位，其餘收成 +N（預設 3） */
  max?: number;
  className?: string;
  style?: string | CSSProperties;
}

/** 成員頭像群組：重疊排列，滑過時展開；超過 max 收成 +N，右邊寫總人數。規則在 core/display.ts。 */
export function AvatarGroup({ people, max = 3, className, style }: AvatarGroupProps) {
  const [spread, setSpread] = useState(false);
  const rest = avatarRest(people, max);
  return (
    <div className={cx('ppl-r', className)} style={styleOf(style)}>
      <div className={avatarStackClass(spread)} role="list" aria-label={avatarNames(people)} onMouseEnter={() => setSpread(true)} onMouseLeave={() => setSpread(false)}>
        {avatarShown(people, max).map((p) => <span key={p.name} className="av" style={avatarStyle(p) as CSSProperties} role="listitem" title={p.name}>{p.initial}</span>)}
        {rest > 0 && <span className="av more" role="listitem" title={avatarNames(people.slice(max))}>{`+${rest}`}</span>}
      </div>
      <span className="ppl-c">{avatarTotal(people)}</span>
    </div>
  );
}
