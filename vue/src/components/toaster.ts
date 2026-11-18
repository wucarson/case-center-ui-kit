import { defineComponent, h, reactive, Teleport } from 'vue';
import Toast from './Toast.vue';

export interface ToastData {
  id?: string;
  title: string;
  detail?: string;
  tone?: 'ok' | 'info' | 'warn';
  action?: { label: string; onClick?: () => void };
}

const state = reactive<{ items: (ToastData & { id: string })[] }>({ items: [] });

/** 顯示提示：有動作 5 秒，沒有 3.2 秒；同 id 就地更新 */
export function toast(t: ToastData) {
  const id = t.id ?? Math.random().toString(36).slice(2);
  state.items = [...state.items.filter((x) => x.id !== id), { ...t, id }];
  setTimeout(() => dismiss(id), t.action ? 5000 : 3200);
  return id;
}
export function dismiss(id: string) { state.items = state.items.filter((x) => x.id !== id); }

/** 全站提示容器：<Toaster /> 放在 App 最外層一次，用 toast({ title }) 呼叫 */
export const Toaster = defineComponent({
  name: 'Toaster',
  setup() {
    return () => h(Teleport, { to: 'body' }, h('div', { 'aria-live': 'polite', style: 'position:fixed;right:16px;bottom:16px;z-index:1100;width:min(360px, calc(100vw - 32px));display:flex;flex-direction:column;gap:8px' },
      state.items.map((t) => h(Toast, { key: t.id, ...t, onAction: () => dismiss(t.id) }))));
  },
});
