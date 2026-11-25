import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { isActivateKey } from '@wucarson/facet-core/dom';
import {
  DIALOG_OVERLAY_STYLE, dialogCancelClass, dialogClass, dialogFocusKey, dialogKey, dialogOkClass, dialogTitleId, focusDialogButton,
  type DialogButton, type DialogFocus,
} from '@wucarson/facet-core/overlay';

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
  initialFocus?: DialogFocus;
}

/** 確認對話框：需要確認才繼續。Esc＝取消；Tab 只在兩顆按鈕間移動。規則在 core/overlay.ts。 */
export function ConfirmDialog({ open, title, body, note, confirmLabel = title, cancelLabel = '取消', destructive, onConfirm, onCancel, inline, initialFocus }: ConfirmDialogProps) {
  const card = useRef<HTMLDivElement>(null);
  const [titleId] = useState(dialogTitleId);
  const [fv, setFv] = useState<DialogButton | null>(null);
  const focusKey = dialogFocusKey(initialFocus, destructive);
  useEffect(() => {
    if (!open || inline || focusKey === 'none') return;
    const prev = document.activeElement as HTMLElement | null;
    focusDialogButton(card.current, focusKey);
    return () => prev?.focus?.();
  }, [open, inline, focusKey]);
  if (!open) return null;
  const btnProps = (k: DialogButton, act?: () => void) => ({
    role: 'button',
    tabIndex: 0,
    onClick: act,
    onKeyDown: (e: KeyboardEvent) => { if (isActivateKey(e.key)) { e.preventDefault(); act?.(); } },
    onFocus: (e: FocusEvent<HTMLElement>) => setFv(e.currentTarget.matches(':focus-visible') ? k : null),
    onBlur: () => setFv(null),
  });
  const onKeyDown = (e: KeyboardEvent) => { if (dialogKey(card.current, e, () => onCancel?.())) e.preventDefault(); };
  const d = (
    <div ref={card} className={dialogClass(inline)} role="dialog" aria-modal={!inline || undefined} aria-labelledby={titleId} onKeyDown={onKeyDown}>
      <b id={titleId}>{title}</b>
      <p><span>{body}</span>{note && <small>{note}</small>}</p>
      <div className="dl-a">
        <span className={dialogCancelClass(fv)} {...btnProps('cancel', onCancel)}>{cancelLabel}</span>
        <span className={dialogOkClass(fv, destructive)} {...btnProps('ok', onConfirm)}>{confirmLabel}</span>
      </div>
    </div>
  );
  if (inline) return d;
  return createPortal(
    <div className="dl open" style={DIALOG_OVERLAY_STYLE as CSSProperties}>
      <i className="dl-bd" onClick={onCancel} />
      {d}
    </div>,
    document.body,
  );
}
