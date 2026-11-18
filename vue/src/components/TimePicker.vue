<script setup lang="ts">
import { computed } from 'vue';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

/** 時間選擇：時、分各自上下調（各自循環，不互相進位）。數值格可聚焦，↑↓ 調整。v-model:value（'HH:mm'） */
const props = withDefaults(defineProps<{
  value: string;
  /** 讀屏名稱，例：「開始時間」 */
  label: string;
  /** 分鐘每次調整幾分（預設 5） */
  step?: number;
  style?: StyleProp;
}>(), { step: 5 });
const emit = defineEmits<{ 'update:value': [string] }>();
const pad = (n: number) => String(n).padStart(2, '0');
const hm = computed(() => props.value.split(':').map(Number));
const set = (h: number, m: number) => emit('update:value', `${pad((h + 24) % 24)}:${pad((m + 60) % 60)}`);
const inc = (part: 'h' | 'm', d: number) => (part === 'h' ? set(hm.value[0] + d, hm.value[1]) : set(hm.value[0], hm.value[1] + d * props.step));
const onKey = (e: KeyboardEvent, part: 'h' | 'm') => {
  if (e.key === 'ArrowUp') { e.preventDefault(); inc(part, 1); }
  if (e.key === 'ArrowDown') { e.preventDefault(); inc(part, -1); }
};
const cols = [{ part: 'h' as const, name: '時', max: 23 }, { part: 'm' as const, name: '分', max: 59 }];
</script>

<template>
  <div class="tp" :style="style" role="group" :aria-label="label"><div class="tp-f" aria-hidden="true"><span class="roll"><span>{{ value }}</span></span><Icon name="clock" /></div><div class="tp-c"><template v-for="(c, i) in cols" :key="c.part"><b v-if="i === 1">:</b><div class="tp-col"><u role="button" tabindex="-1" :aria-label="`${c.name}加一`" @click="inc(c.part, 1)"><Icon name="chevronUp" /></u><span class="v" role="spinbutton" tabindex="0" :aria-label="c.name" :aria-valuenow="hm[i]" aria-valuemin="0" :aria-valuemax="c.max" @keydown="onKey($event, c.part)"><span class="roll"><span>{{ pad(hm[i]) }}</span></span></span><u role="button" tabindex="-1" :aria-label="`${c.name}減一`" @click="inc(c.part, -1)"><Icon name="chevronDown" /></u></div></template></div></div>
</template>
