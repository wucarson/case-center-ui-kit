import { computed, type ComputedRef } from 'vue';

/**
 * 表單值：同時支援標準 v-model（modelValue）與具名的 v-model:value／v-model:checked。
 * 有給 modelValue 就以它為準；改值時兩個事件都送，用哪種寫法都收得到。
 *   const { val, set } = useFormValue(props, 'value', emit, '');
 */
export function useFormValue<T>(props: { modelValue?: T }, key: 'value' | 'checked', emit: (...a: any[]) => void, fallback: T): { val: ComputedRef<T>; set: (v: T) => void } {
  const val = computed<T>(() => (props.modelValue !== undefined ? props.modelValue : (((props as Record<string, unknown>)[key] as T | undefined) ?? fallback)));
  const set = (v: T) => { emit(`update:${key}`, v); emit('update:modelValue', v); };
  return { val, set };
}

/** 焦點離開整個元件（不是移到元件裡的另一個元素）才送 blur：給表單函式庫標記 touched（例：VeeValidate 的 handleBlur） */
export function useFormBlur(emit: (...a: any[]) => void) {
  return (e: FocusEvent) => { if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node | null)) emit('blur'); };
}
