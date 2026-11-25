import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { HOLD_MS, HoldControl, holdClass, holdFill, holdHint, holdText, isHoldKey, type HoldPhase } from '@case-center/core/hold';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export interface HoldConfirmProps {
  /** 動作名稱，例：「結案」→ 按鈕寫「按住結案」 */
  label: string;
  /** 按滿才呼叫 */
  onConfirm?: () => void;
  /** 按住多久（ms，預設 1500） */
  duration?: number;
  /** 下方說明；預設「按住 1.5 秒才會送出」 */
  hint?: string;
  disabled?: boolean;
  /** 固定顯示按住進度 0–1（展示、文件用） */
  progress?: number;
  /** 固定顯示完成（展示、文件用） */
  done?: boolean;
  className?: string;
  style?: string | CSSProperties;
}

/** 按住確認：按住一段時間才送出；放開、移出或按 Esc 就取消。鍵盤按住 Space／Enter。規則在 core/hold.ts。 */
export function HoldConfirm({ label, onConfirm, duration = HOLD_MS, hint, disabled, progress, done, className, style }: HoldConfirmProps) {
  const hintId = useId();
  const [{ p, phase }, setState] = useState<{ p: number; phase: HoldPhase }>({ p: 0, phase: 'idle' });
  const confirm = useRef(onConfirm);
  confirm.current = onConfirm;
  const ctl = useRef<HoldControl>();
  ctl.current ??= new HoldControl((p, phase) => setState({ p, phase }), () => confirm.current?.(), duration);
  ctl.current.duration = duration;
  useEffect(() => () => ctl.current?.dispose(), []);
  const c = ctl.current;
  const shownPhase: HoldPhase = done ? 'done' : progress !== undefined ? 'holding' : phase;
  const fill = holdFill(progress ?? p) ?? undefined;
  const press = () => { if (!disabled) c.press(); };
  const onKeyDown = (e: KeyboardEvent) => {
    if (isHoldKey(e.key)) { e.preventDefault(); if (!e.repeat) press(); }
    else if (e.key === 'Escape') c.release();
  };
  return (
    <div className={cx('hold-c', className)} style={styleOf(style)}>
      <button
        type="button"
        className={holdClass(shownPhase, disabled)}
        disabled={disabled}
        aria-describedby={hintId}
        onPointerDown={(e) => { if (e.button === 0) { e.currentTarget.setPointerCapture(e.pointerId); press(); } }}
        onPointerUp={() => c.release()}
        onPointerCancel={() => c.release()}
        onLostPointerCapture={() => c.release()}
        onKeyDown={onKeyDown}
        onKeyUp={(e) => { if (isHoldKey(e.key)) c.release(); }}
        onBlur={() => c.release()}
      >
        <i className="fill" style={fill ? { transform: fill } : undefined} /><i className="bar" style={fill ? { transform: fill } : undefined} />
        <span className="roll"><span>{shownPhase === 'done' && <Icon name="check" className="draw" />}{holdText(label, shownPhase)}</span></span>
      </button>
      <div className="hold-h" id={hintId}>{hint ?? holdHint(duration)}</div>
    </div>
  );
}
