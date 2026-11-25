import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { STAR_PATH, isStarToggleKey, starClass } from '@wucarson/facet-core/choice';
import { burst } from '@wucarson/facet-core/burst';
import { cx, styleOf } from './util';

export interface StarToggleProps {
  on: boolean;
  onChange?: (on: boolean) => void;
  /** 讀屏名稱，例：「追蹤案件」 */
  label: string;
  className?: string;
  style?: string | CSSProperties;
}

/** 追蹤星號：點一下追蹤（填滿＋星光）、再點取消。Enter／空白鍵切換。規則在 core/choice.ts。 */
export function StarToggle({ on, onChange, label, className, style }: StarToggleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const toggle = () => { if (!on && ref.current) burst(ref.current); onChange?.(!on); };
  const onKeyDown = (e: KeyboardEvent) => { if (isStarToggleKey(e.key)) { e.preventDefault(); toggle(); } };
  return (
    <span ref={ref} className={cx(starClass(on), className)} style={styleOf(style)} role="button" tabIndex={0} aria-pressed={on} aria-label={label} onClick={toggle} onKeyDown={onKeyDown}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={STAR_PATH} /></svg>
    </span>
  );
}
