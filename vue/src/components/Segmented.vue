<script setup lang="ts">
import { ref } from 'vue';
import { focusNth, segmentedClass, segmentedColumns, segmentedKey, segmentedThumb } from '../../../core/choice';
import type { StyleProp } from './util';

/** 分段切換：選中片彈性滑動。左右鍵切換。v-model:value（選中的索引）。規則在 core/choice.ts。 */
const props = withDefaults(defineProps<{
  /** 2–4 個互斥選項 */
  options: string[];
  value: number;
  /** sm＝對話框、卡片內 */
  size?: 'md' | 'sm';
  style?: StyleProp;
}>(), { size: 'md' });
const emit = defineEmits<{ 'update:value': [number] }>();
const root = ref<HTMLElement>();
const onKey = (e: KeyboardEvent, i: number) => {
  const r = segmentedKey(e.key, i, props.options.length);
  if (!r) return;
  e.preventDefault();
  emit('update:value', r.index);
  if (r.focus && root.value) focusNth(root.value, '[role="radio"]', r.index);
};
</script>

<template>
  <div ref="root" role="radiogroup" :class="segmentedClass(size)" :style="[{ gridTemplateColumns: segmentedColumns(options.length) }, style as any]"><i :style="segmentedThumb(options.length, value)" /><span v-for="(t, i) in options" :key="t" role="radio" :aria-checked="i === value" :tabindex="i === value ? 0 : -1" :class="i === value ? 'on' : undefined" @click="emit('update:value', i)" @keydown="onKey($event, i)">{{ t }}</span></div>
</template>
