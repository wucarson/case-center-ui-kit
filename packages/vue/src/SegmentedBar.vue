<script setup lang="ts">
import { legendDotStyle, segmentBarLabel, segmentStyle, segmentTotal, type BarSegment } from '@case-center/core/metrics';
import MetricNum from './MetricNum.vue';
import type { StyleProp } from './util';

/** 分段統計條：總數＋比例條＋圖例數字（顏色不是唯一資訊）。規則在 core/metrics.ts。 */
withDefaults(defineProps<{
  segments: BarSegment[];
  /** 總數後的單位，例：「件工單」 */
  unit?: string;
  animate?: boolean;
  style?: StyleProp;
}>(), { unit: '件' });
</script>

<template>
  <div class="sb" :style="style"><div class="sb-h"><MetricNum :value="segmentTotal(segments)" :animate="animate" /><span>{{ unit }}</span></div><div class="sb-b" role="img" :aria-label="segmentBarLabel(segments, unit)"><i v-for="(s, i) in segments" :key="s.label" :style="segmentStyle(s, i)" /></div><div class="sb-l"><span v-for="(s, i) in segments" :key="s.label"><i :style="legendDotStyle(s, i)" />{{ s.label }}<MetricNum :value="s.value" :animate="animate" /></span></div></div>
</template>
