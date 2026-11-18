<script setup lang="ts">
import { computed } from 'vue';
import { cx, type StyleProp } from './util';

export type BadgeTone = 'plan' | 'active' | 'pause' | 'closed' | 'danger' | 'none';
const TONE: Record<BadgeTone, string> = { plan: 't-q', active: 't-a', pause: 't-p', closed: 't-c', danger: 't-d', none: 't-q' };

/** 狀態徽章：顏色＋圓點＋文字。 */
const props = withDefaults(defineProps<{
  /** 狀態文字：一定要寫出來，不要只靠顏色 */
  label: string;
  /** plan 規劃中（空心點）、active 進行中、pause 暫停、closed 已結案、danger 退回／逾期、none 不在對映表裡的值 */
  tone: BadgeTone;
  /** filled＝列表的狀態欄；outline＝頁首、卡片上；plain＝空間很小時 */
  appearance?: 'filled' | 'outline' | 'plain';
  /** 圓點（tone="none" 預設不顯示） */
  showIndicator?: boolean;
  style?: StyleProp;
}>(), { appearance: 'filled', showIndicator: undefined });
const dot = computed(() => props.showIndicator ?? props.tone !== 'none');
</script>

<template>
  <span :class="cx('bdg', TONE[tone], appearance === 'outline' && 'ol', appearance === 'plain' && 'pl', !dot && 'nodot')" :style="style"><i v-if="dot" aria-hidden="true" />{{ label }}</span>
</template>
