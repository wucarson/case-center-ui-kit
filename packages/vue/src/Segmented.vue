<script setup lang="ts">
import { useFormBlur, useFormValue } from './form';
import { ref } from 'vue';
import { focusNth, segmentedClass, segmentedColumns, segmentedKey, segmentedThumb } from '@wucarson/facet-core/choice';
import type { StyleProp } from './util';

/** 分段切換：選中片彈性滑動。左右鍵切換。v-model:value（選中的索引）。規則在 core/choice.ts。 */
const props = withDefaults(defineProps<{
  /** 2–4 個互斥選項 */
  options: string[];
  value?: number;
  /** 標準 v-model */
  modelValue?: number;
  /** 停用：不能切換（展示牆尚無停用樣式） */
  disabled?: boolean;
  /** sm＝對話框、卡片內 */
  size?: 'md' | 'sm';
  style?: StyleProp;
}>(), { size: 'md' });
const emit = defineEmits<{ 'update:value': [number]; 'update:modelValue': [number]; blur: [] }>();
const { val, set } = useFormValue(props, 'value', emit, 0);
const onOut = useFormBlur(emit);
const select = (i: number) => { if (!props.disabled) set(i); };
const root = ref<HTMLElement>();
const onKey = (e: KeyboardEvent, i: number) => {
  const r = segmentedKey(e.key, i, props.options.length);
  if (!r || props.disabled) return;
  e.preventDefault();
  set(r.index);
  if (r.focus && root.value) focusNth(root.value, '[role="radio"]', r.index);
};
</script>

<template>
  <div ref="root" role="radiogroup" :class="[segmentedClass(size), disabled && 'dis']" :style="[{ gridTemplateColumns: segmentedColumns(options.length) }, style as any]" :aria-disabled="disabled || undefined" @focusout="onOut"><i :style="segmentedThumb(options.length, val)" /><span v-for="(t, i) in options" :key="t" role="radio" :aria-checked="i === val" :tabindex="i === val && !disabled ? 0 : -1" :class="i === val ? 'on' : undefined" @click="select(i)" @keydown="onKey($event, i)">{{ t }}</span></div>
</template>
