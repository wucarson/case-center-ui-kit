<script setup lang="ts">
import { ICONS } from '../../../shared/icons';
import { cx, useFocusVisible, type StyleProp } from './util';

/** 核取方塊：要按儲存才生效的多選。Space 切換。v-model:checked */
const props = defineProps<{
  checked?: boolean;
  /** 部分選取（全選的半選狀態） */
  indeterminate?: boolean;
  label?: string;
  /** 全選列：粗體、下方分隔線 */
  selectAll?: boolean;
  disabled?: boolean;
  style?: StyleProp;
}>();
const emit = defineEmits<{ 'update:checked': [boolean] }>();
const { focusVisible, onFocus, onBlur } = useFocusVisible();
const toggle = () => { if (!props.disabled) emit('update:checked', props.indeterminate ? true : !props.checked); };
const onKey = (e: KeyboardEvent) => { if (e.key === ' ') { e.preventDefault(); toggle(); } };
</script>

<template>
  <div role="checkbox" :aria-checked="indeterminate ? 'mixed' : !!checked" :aria-disabled="disabled || undefined" :tabindex="disabled ? -1 : 0" :class="cx('ck', selectAll && 'all', indeterminate ? 'some' : checked && 'on', disabled && 'dis')" :style="style" @click="toggle" @keydown="onKey" @focus="onFocus" @blur="onBlur"><i :class="focusVisible ? 'is-focus' : undefined"><svg class="ic chk" viewBox="0 0 24 24" aria-hidden="true" v-html="ICONS.check" /><svg class="ic dash" viewBox="0 0 24 24" aria-hidden="true" v-html="ICONS.dash" /></i><span v-if="label">{{ label }}</span></div>
</template>
