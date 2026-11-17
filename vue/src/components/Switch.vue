<script setup lang="ts">
import { cx, useFocusVisible, type StyleProp } from './util';

/** 開關：立即生效，不用再按儲存。Space／Enter 切換。v-model:checked */
const props = withDefaults(defineProps<{
  checked: boolean;
  /** 標籤：放在左邊；沒有可見標籤時一定要給 aria-label */
  label?: string;
  /** sm＝欄位面板、表格內 */
  size?: 'md' | 'sm';
  disabled?: boolean;
  style?: StyleProp;
}>(), { size: 'md' });
const emit = defineEmits<{ 'update:checked': [boolean] }>();
const { focusVisible, onFocus, onBlur } = useFocusVisible();
const toggle = () => { if (!props.disabled) emit('update:checked', !props.checked); };
const onKey = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } };
</script>

<template>
  <div role="switch" :aria-checked="checked" :aria-disabled="disabled || undefined" :tabindex="disabled ? -1 : 0" :class="cx('tgr', checked && 'on', disabled && 'dis')" :style="style" @click="toggle" @keydown="onKey" @focus="onFocus" @blur="onBlur"><span v-if="label">{{ label }}</span><span :class="cx('tg', size === 'sm' && 'sm', focusVisible && 'is-focus')"><i /></span></div>
</template>
