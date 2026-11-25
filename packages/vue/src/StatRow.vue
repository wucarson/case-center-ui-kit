<script setup lang="ts">
import { statClass, statsStyle, type StatItem } from '@case-center/core/metrics';
import MetricNum from './MetricNum.vue';
import type { StyleProp } from './util';

/** 統計卡：一列重點數字；第一個常設為重點（hot，主色）。規則在 core/metrics.ts。 */
defineProps<{
  /** 2–4 個重點數字 */
  items: StatItem[];
  /** 數字變動時滾動更新 */
  animate?: boolean;
  style?: StyleProp;
}>();
</script>

<template>
  <div class="stats" role="list" :style="[statsStyle(items.length), style as any]"><div v-for="s in items" :key="s.label" :class="statClass(s.hot)" role="listitem"><span>{{ s.label }}</span><MetricNum :value="s.value" :animate="animate" /><small v-if="s.unit">{{ s.unit }}</small></div></div>
</template>
