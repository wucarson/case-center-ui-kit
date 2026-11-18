import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { burst } from '../../../shared/burst';
import { cx, styleOf } from './util';

export interface StarToggleProps {
  on: boolean;
  onChange?: (on: boolean) => void;
  /** 讀屏名稱，例：「追蹤案件」 */
  label: string;
  className?: string;
  style?: string | CSSProperties;
}

/** 追蹤星號：點一下追蹤（填滿＋星光）、再點取消。Enter／空白鍵切換。 */
export function StarToggle({ on, onChange, label, className, style }: StarToggleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const toggle = () => { if (!on && ref.current) burst(ref.current); onChange?.(!on); };
  const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
  return (
    <span ref={ref} className={cx('starb', on && 'on', className)} style={styleOf(style)} role="button" tabIndex={0} aria-pressed={on} aria-label={label} onClick={toggle} onKeyDown={onKeyDown}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z" /></svg>
    </span>
  );
}
