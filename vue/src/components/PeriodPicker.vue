<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { PERIODS, fmtRange, periodRange, todayISO, type PeriodKey } from '../../../shared/dates';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

/** 期間選擇：本月、近 30 天、近 90 天或自訂；範圍以文字寫出。選中片滑動，左右鍵切換。v-model:value */
const props = defineProps<{
  value: PeriodKey;
  /** 「自訂」的起訖 'YYYY-MM-DD' */
  custom?: [string, string];
  /** 今天（測試、資料截止日用）；預設是系統今天 */
  today?: string;
  style?: StyleProp;
}>();
const emit = defineEmits<{ 'update:value': [PeriodKey] }>();
const ps = ref<HTMLElement>();
const pill = ref<HTMLElement>();
const cur = computed(() => PERIODS.findIndex((p) => p.key === props.value));
const range = computed(() => fmtRange(periodRange(props.value, props.today ?? todayISO(), props.custom)));
// 選中片：量選中項目的位置（量法同展示牆）
watch(() => props.value, async () => {
  await nextTick();
  const on = ps.value?.querySelector<HTMLElement>(':scope > span.on');
  if (on && pill.value) { pill.value.style.width = `${on.offsetWidth}px`; pill.value.style.transform = `translateX(${on.offsetLeft}px)`; }
}, { immediate: true });
const onKey = (e: KeyboardEvent) => {
  const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
  if (!d) return;
  e.preventDefault();
  const n = (cur.value + d + PERIODS.length) % PERIODS.length;
  emit('update:value', PERIODS[n].key);
  ps.value?.querySelectorAll<HTMLElement>('[role="radio"]')[n]?.focus();
};
</script>

<template>
  <div :style="style"><div ref="ps" class="ps" role="radiogroup" aria-label="期間" @keydown="onKey"><i ref="pill" /><span v-for="(p, i) in PERIODS" :key="p.key" role="radio" :aria-checked="i === cur" :tabindex="i === cur ? 0 : -1" :class="i === cur ? 'on' : undefined" @click="emit('update:value', p.key)">{{ p.label }}<Icon v-if="p.key === 'custom'" name="chevronDown" /></span></div><div class="ps-r">{{ range }}</div></div>
</template>
