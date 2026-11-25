<script setup lang="ts">
import { computed } from 'vue';
import { checkboxAttrs, checkboxClass, checkboxNext, isCheckboxToggleKey } from '@case-center/core/choice';
import { ICONS } from '@case-center/core/icons';
import { useFocusVisible, type StyleProp } from './util';

/** 核取方塊：要按儲存才生效的多選。Space 切換。v-model:checked。規則在 core/choice.ts。 */
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
const s = computed(() => ({ checked: props.checked, indeterminate: props.indeterminate, selectAll: props.selectAll, disabled: props.disabled }));
const a = computed(() => checkboxAttrs(s.value));
const toggle = () => { const next = checkboxNext(s.value); if (next !== null) emit('update:checked', next); };
const onKey = (e: KeyboardEvent) => { if (isCheckboxToggleKey(e.key)) { e.preventDefault(); toggle(); } };
</script>

<template>
  <div role="checkbox" :aria-checked="a['aria-checked']" :aria-disabled="a['aria-disabled'] ?? undefined" :tabindex="a.tabindex" :class="checkboxClass(s)" :style="style" @click="toggle" @keydown="onKey" @focus="onFocus" @blur="onBlur"><i :class="focusVisible ? 'is-focus' : undefined"><svg class="ic chk" viewBox="0 0 24 24" aria-hidden="true" v-html="ICONS.check" /><svg class="ic dash" viewBox="0 0 24 24" aria-hidden="true" v-html="ICONS.dash" /></i><span v-if="label">{{ label }}</span></div>
</template>
