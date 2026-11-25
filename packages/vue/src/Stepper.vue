<script setup lang="ts">
import Icon from './Icon.vue';
import type { StyleProp } from './util';

/** 流程步驟：完成打勾、目前加框、未開始虛線。只顯示進度，不能點。 */
const props = defineProps<{
  /** note：完成日、負責人・進行中；未開始可省略（顯示「未開始」） */
  steps: { label: string; note?: string }[];
  /** 目前階段的索引；之前的都算完成（-1＝都還沒開始） */
  current: number;
  style?: StyleProp;
}>();
const st = (j: number) => (j < props.current ? 'done' : j === props.current ? 'cur' : 'todo');
</script>

<template>
  <div class="fl" :style="style" role="list"><div v-for="(s, j) in steps" :key="j" :class="'fs ' + st(j)" role="listitem" :aria-current="st(j) === 'cur' ? 'step' : undefined"><p><Icon name="check" />{{ s.label }}</p><small>{{ s.note ?? (st(j) === 'todo' ? '未開始' : '') }}</small></div></div>
</template>
