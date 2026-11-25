import { ref, type StyleValue } from 'vue';

/** 組 class：略過 false／空字串 */
export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/** 'width:100%;gap:8px' 這種字串直接當 style 用（Vue 支援字串 style），物件也照樣傳 */
export type StyleProp = string | StyleValue;

/**
 * 鍵盤聚焦（:focus-visible）時才為 true：給「焦點框畫在子元素上」的元件用
 * （核取方塊的方框、開關的軌道），樣式沿用 components.css 的 .is-focus。
 */
export function useFocusVisible() {
  const focusVisible = ref(false);
  const onFocus = (e: FocusEvent) => { focusVisible.value = (e.currentTarget as HTMLElement).matches(':focus-visible'); };
  const onBlur = () => { focusVisible.value = false; };
  return { focusVisible, onFocus, onBlur };
}
