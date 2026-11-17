<script setup lang="ts">
import { ref } from 'vue';
import type { StyleProp } from './util';

/** 分段切換：選中片彈性滑動。左右鍵切換。v-model:value（選中的索引） */
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
const pick = (i: number, focus = false) => {
  emit('update:value', i);
  if (focus) root.value?.querySelectorAll<HTMLElement>('[role="radio"]')[i]?.focus();
};
const onKey = (e: KeyboardEvent, i: number) => {
  const n = props.options.length;
  const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
  if (d) { e.preventDefault(); pick((i + d + n) % n, true); }
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(i); }
};
</script>

<template>
  <div ref="root" role="radiogroup" :class="['seg', size === 'sm' && 'sm']" :style="[{ gridTemplateColumns: `repeat(${options.length},1fr)` }, style as any]"><i :style="{ width: `calc((100% - 6px) / ${options.length})`, transform: `translateX(${value * 100}%)` }" /><span v-for="(t, i) in options" :key="t" role="radio" :aria-checked="i === value" :tabindex="i === value ? 0 : -1" :class="i === value ? 'on' : undefined" @click="pick(i)" @keydown="onKey($event, i)">{{ t }}</span></div>
</template>
