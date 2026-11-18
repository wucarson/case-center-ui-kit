<script setup lang="ts">
import { computed } from 'vue';
import { isSwitchToggleKey, switchNext, switchRootAttrs, switchRootClass, switchTrackClass } from '../../../core/switch';
import { useFocusVisible, type StyleProp } from './util';

/** 開關：立即生效，不用再按儲存。Space／Enter 切換。v-model:checked。規則在 core/switch.ts。 */
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
const s = computed(() => ({ checked: props.checked, disabled: props.disabled, size: props.size }));
const a = computed(() => switchRootAttrs(s.value));
const toggle = () => { const next = switchNext(s.value); if (next !== null) emit('update:checked', next); };
const onKey = (e: KeyboardEvent) => { if (isSwitchToggleKey(e.key)) { e.preventDefault(); toggle(); } };
</script>

<template>
  <div role="switch" :aria-checked="a['aria-checked']" :aria-disabled="a['aria-disabled'] ?? undefined" :tabindex="a.tabindex" :class="switchRootClass(s)" :style="style" @click="toggle" @keydown="onKey" @focus="onFocus" @blur="onBlur"><span v-if="label">{{ label }}</span><span :class="switchTrackClass(s, focusVisible)"><i /></span></div>
</template>
