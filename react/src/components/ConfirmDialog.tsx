import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from './util';

export interface ConfirmDialogProps {
  open: boolean;
  /** 與觸發按鈕同名，不寫「確定要…嗎？」 */
  title: string;
  body: ReactNode;
  /** 補充說明，較弱字色（例：影響範圍） */
  note?: string;
  /** 確認鈕文字，通常與標題相同 */
  confirmLabel?: string;
  cancelLabel?: string;
  /** 破壞性：確認鈕紅底，焦點先在取消 */
  destructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** 只畫對話框本體、不浮起（展示、文件用） */
  inline?: boolean;
  /** 一開始聚焦的按鈕（預設：破壞性＝取消，其他＝確認） */
  initialFocus?: 'confirm' | 'cancel' | 'none';
}

/** 確認對話框：需要確認才繼續。Esc＝取消；Tab 只在兩顆按鈕間移動。 */
export function ConfirmDialog({ open, title, body, note, confirmLabel = title, cancelLabel = '取消', destructive, onConfirm, onCancel, inline, initialFocus }: ConfirmDialogProps) {
  const card = useRef<HTMLDivElement>(null);
  const [fv, setFv] = useState<'ok' | 'cancel' | null>(null);
  const focusKey = initialFocus ?? (destructive ? 'cancel' : 'confirm');
  useEffect(() => {
    if (!open || inline || focusKey === 'none') return;
    const prev = document.activeElement as HTMLElement | null;
    card.current?.querySelector<HTMLElement>(focusKey === 'cancel' ? '.cancel' : '.ok')?.focus();
    return () => prev?.focus?.();
  }, [open, inline, focusKey]);
  if (!open) return null;
  const btnProps = (k: 'ok' | 'cancel', act?: () => void) => ({
    role: 'button',
    tabIndex: 0,
    onClick: act,
    onKeyDown: (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act?.(); } },
    onFocus: (e: React.FocusEvent<HTMLElement>) => setFv(e.currentTarget.matches(':focus-visible') ? k : null),
    onBlur: () => setFv(null),
  });
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onCancel?.(); }
    if (e.key === 'Tab') { // 焦點留在對話框裡
      const f = [...(card.current?.querySelectorAll<HTMLElement>('[role="button"]') ?? [])];
      const i = f.indexOf(document.activeElement as HTMLElement);
      e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length]?.focus();
    }
  };
  const d = (
    <div ref={card} className={cx('dl-d', inline && 'pin')} role="dialog" aria-modal={!inline || undefined} aria-labelledby="cc-dl-t" onKeyDown={onKeyDown}>
      <b id="cc-dl-t">{title}</b>
      <p><span>{body}</span>{note && <small>{note}</small>}</p>
      <div className="dl-a">
        <span className={cx('cancel', fv === 'cancel' && 'fc')} {...btnProps('cancel', onCancel)}>{cancelLabel}</span>
        <span className={cx('ok', destructive && 'dng', fv === 'ok' && 'is-focus')} {...btnProps('ok', onConfirm)}>{confirmLabel}</span>
      </div>
    </div>
  );
  if (inline) return d;
  return createPortal(
    <div className="dl open" style={{ position: 'fixed', inset: 0, zIndex: 1000, borderRadius: 0 }}>
      <i className="dl-bd" onClick={onCancel} />
      {d}
    </div>,
    document.body,
  );
}
