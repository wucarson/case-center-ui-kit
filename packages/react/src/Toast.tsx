import { useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { TOASTER_STYLE, TOAST_ICON, dismiss, getToasts, isToastActionKey, subscribeToasts, toast, toastClass, type ToastData } from '@wucarson/facet-core/toast';
import { Icon } from './Icon';

export { toast, dismiss, type ToastData };

/** 單則提示（.toast）。規則在 core/toast.ts。 */
export function Toast({ title, detail, tone = 'ok', action, onAction }: ToastData & { onAction?: () => void }) {
  const run = () => { action?.onClick?.(); onAction?.(); };
  return (
    <div className={toastClass(tone)} role="status">
      <Icon name={TOAST_ICON[tone]} />
      <div><b>{title}</b>{detail && <small>{detail}</small>}</div>
      {action && <em role="button" tabIndex={0} onClick={run} onKeyDown={(e) => { if (isToastActionKey(e.key)) run(); }}>{action.label}</em>}
    </div>
  );
}

/** 全站提示：toast({ title }) 呼叫，<Toaster /> 放在 App 最外層一次 */
export function Toaster() {
  const list = useSyncExternalStore(subscribeToasts, getToasts);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <div aria-live="polite" style={TOASTER_STYLE as CSSProperties}>
      {list.map((t) => <Toast key={t.id} {...t} onAction={() => dismiss(t.id)} />)}
    </div>,
    document.body,
  );
}
