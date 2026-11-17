<script setup lang="ts">
import { computed, ref } from 'vue';
import { cx, type StyleProp } from './util';

export interface RadioOption { value: string; label: string; description?: string; disabled?: boolean }

/** 單選清單：2–5 個互斥選項、選項都看得到。方向鍵切換。v-model:value */
const props = defineProps<{
  options: RadioOption[];
  value?: string;
  /** 只有一個選項、不包外層清單（展示單一狀態用） */
  single?: boolean;
  style?: StyleProp;
}>();
const emit = defineEmits<{ 'update:value': [string] }>();
const root = ref<HTMLElement>();
const focusAt = ref(-1);
const cur = computed(() => props.options.findIndex((o) => o.value === props.value));
const pick = (o: RadioOption) => { if (!o.disabled) emit('update:value', o.value); };
const move = (from: number, d: number) => {
  const n = props.options.length;
  for (let k = 1; k <= n; k++) {
    const i = (from + d * k + n) % n;
    if (!props.options[i].disabled) { emit('update:value', props.options[i].value); root.value?.querySelectorAll<HTMLElement>('[role="radio"]')[i]?.focus(); return; }
  }
};
const onKey = (e: KeyboardEvent, i: number) => {
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(props.options[i]); }
  const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
  if (d) { e.preventDefault(); move(i, d); }
};
const onFocus = (e: FocusEvent, i: number) => { focusAt.value = (e.currentTarget as HTMLElement).matches(':focus-visible') ? i : -1; };
const tab = (o: RadioOption, i: number) => (o.disabled ? -1 : (cur.value < 0 ? i === 0 : i === cur.value) ? 0 : -1);
</script>

<template>
  <div ref="root" role="radiogroup" :class="single ? undefined : 'rads'" :style="single ? { display: 'contents' } : style"><div v-for="(o, i) in options" :key="o.value" role="radio" :aria-checked="o.value === value" :aria-disabled="o.disabled || undefined" :tabindex="tab(o, i)" :class="cx('rad', o.value === value && 'on', !!o.description && 'tall', o.disabled && 'dis')" @click="pick(o)" @keydown="onKey($event, i)" @focus="onFocus($event, i)" @blur="focusAt = -1"><i :class="focusAt === i ? 'is-focus' : undefined" /><span v-if="o.description"><b>{{ o.label }}</b><small>{{ o.description }}</small></span><template v-else>{{ o.label }}</template></div></div>
</template>
