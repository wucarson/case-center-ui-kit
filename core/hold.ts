/**
 * 按住確認（contracts/hold-to-confirm.json）：按住一段時間才送出，防止誤觸不可逆的動作。
 * 滑鼠、觸控按住；鍵盤按住 Space／Enter；中途放開、移出或按 Esc 就取消。
 * 減少動態時不做連續動畫，改成 25% 一格跳，但仍要按滿。
 */
import { cx } from './dom';

export const HOLD_MS = 1500;
/** 完成後多久回到初始狀態 */
export const HOLD_RESET_MS = 1900;
export type HoldPhase = 'idle' | 'holding' | 'done';

export const holdClass = (phase: HoldPhase, disabled?: boolean) => cx('btn hold', phase === 'done' && 'done', disabled && 'is-off');
/** 按鈕文字：按住結案 → 持續按住… → 已結案（完成時前面加打勾） */
export const holdText = (label: string, phase: HoldPhase) => (phase === 'holding' ? '持續按住…' : phase === 'done' ? `已${label}` : `按住${label}`);
/** 說明：寫出要按多久 */
export const holdHint = (ms = HOLD_MS) => `按住 ${ms / 1000} 秒才會送出`;
/** 進度條的 transform（0 時不寫） */
export const holdFill = (p: number) => (p > 0 ? `scaleX(${p})` : null);
export const isHoldKey = (key: string) => key === ' ' || key === 'Enter';

const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 按住計時（不依賴框架；外殼把 set 接到自己的狀態，onConfirm 接到送出） */
export class HoldControl {
  private raf = 0;
  private start = 0;
  private reset = 0;
  phase: HoldPhase = 'idle';
  constructor(
    private readonly set: (progress: number, phase: HoldPhase) => void,
    private readonly onConfirm: () => void,
    public duration = HOLD_MS,
  ) {}
  private emit(p: number, phase: HoldPhase) { this.phase = phase; this.set(p, phase); }
  /** 開始按住（已在按住或完成時忽略） */
  press() {
    if (this.phase !== 'idle') return;
    this.start = performance.now();
    this.emit(0, 'holding');
    const step = (t: number) => {
      const raw = Math.min(1, (t - this.start) / this.duration);
      if (raw >= 1) { this.emit(0, 'done'); this.onConfirm(); this.reset = window.setTimeout(() => this.emit(0, 'idle'), HOLD_RESET_MS); return; }
      this.emit(reducedMotion() ? Math.floor(raw * 4) / 4 : raw, 'holding');
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }
  /** 放開、移出、Esc、失焦：還沒按滿就取消 */
  release() {
    if (this.phase !== 'holding') return;
    cancelAnimationFrame(this.raf);
    this.emit(0, 'idle');
  }
  dispose() { cancelAnimationFrame(this.raf); clearTimeout(this.reset); }
}
