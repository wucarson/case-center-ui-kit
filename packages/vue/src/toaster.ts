import { defineComponent, h, onBeforeUnmount, shallowRef, Teleport } from 'vue';
import { TOASTER_STYLE, dismiss, getToasts, subscribeToasts, toast, type ToastData } from '@case-center/core/toast';
import Toast from './Toast.vue';

export { toast, dismiss, type ToastData };

/** 全站提示容器：<Toaster /> 放在 App 最外層一次，用 toast({ title }) 呼叫。佇列在 core/toast.ts。 */
export const Toaster = defineComponent({
  name: 'Toaster',
  setup() {
    const list = shallowRef(getToasts());
    onBeforeUnmount(subscribeToasts(() => { list.value = getToasts(); }));
    return () => h(Teleport, { to: 'body' }, h('div', { 'aria-live': 'polite', style: TOASTER_STYLE },
      list.value.map((t) => h(Toast, { key: t.id, ...t, onAction: () => dismiss(t.id) }))));
  },
});
