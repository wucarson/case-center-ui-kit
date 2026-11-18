import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { cx } from './util';

export interface ToastData {
  id?: string;
  /** 主訊息，寫結果：「已儲存」 */
  title: string;
  /** 補述，例：「等待 陳大文 覆核」 */
  detail?: string;
  tone?: 'ok' | 'info' | 'warn';
  /** 給了就顯示動作（例：「復原」），停留時間延長 */
  action?: { label: string; onClick: () => void };
}

const TONE_ICON = { ok: 'ok', info: 'info', warn: 'warn' } as const;

/** 單則提示（.toast） */
export function Toast({ title, detail, tone = 'ok', action, onAction }: ToastData & { onAction?: () => void }) {
  return (
    <div className={cx('toast', tone)} role="status">
      <Icon name={TONE_ICON[tone]} />
      <div><b>{title}</b>{detail && <small>{detail}</small>}</div>
      {action && <em role="button" tabIndex={0} onClick={() => { action.onClick(); onAction?.(); }} onKeyDown={(e) => { if (e.key === 'Enter') { action.onClick(); onAction?.(); } }}>{action.label}</em>}
    </div>
  );
}

// ---- 全站提示：toast({ title }) 呼叫，<Toaster /> 放在 App 最外層一次 ----
type Item = Required<Pick<ToastData, 'id'>> & ToastData;
let items: Item[] = [];
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
/** 顯示提示：有動作 5 秒，沒有 3.2 秒；同 id 就地更新 */
export function toast(t: ToastData) {
  const id = t.id ?? Math.random().toString(36).slice(2);
  items = [...items.filter((x) => x.id !== id), { ...t, id }];
  emit();
  setTimeout(() => dismiss(id), t.action ? 5000 : 3200);
  return id;
}
export function dismiss(id: string) { items = items.filter((x) => x.id !== id); emit(); }

export function Toaster() {
  const list = useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <div aria-live="polite" style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1100, width: 'min(360px, calc(100vw - 32px))', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {list.map((t) => <Toast key={t.id} {...t} onAction={() => dismiss(t.id)} />)}
    </div>,
    document.body,
  );
}
