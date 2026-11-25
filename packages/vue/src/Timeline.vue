<script setup lang="ts">
import type { IconName } from '@case-center/core/icons';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

export type TimelineType = 'edit' | 'done' | 'due';
const CLS: Record<TimelineType, string> = { edit: 'a', done: 'b', due: 'c' };
const ICON: Record<TimelineType, IconName> = { edit: 'edit', done: 'check', due: 'due' };

/** 歷程：最新的在最上面；每筆是圖示＋人名動作＋相對時間。 */
defineProps<{
  /** type：edit＝變更、新增；done＝完成、通過；due＝時間、期限相關。text：人名＋動作；time：相對時間 */
  items: { type: TimelineType; text: string; time: string }[];
  style?: StyleProp;
}>();
</script>

<template>
  <div class="nts" :style="style" role="list"><div v-for="(it, k) in items" :key="k" class="nt" role="listitem"><i :class="CLS[it.type]" aria-hidden="true"><Icon :name="ICON[it.type]" /></i><div><p>{{ it.text }}</p><small>{{ it.time }}</small></div></div></div>
</template>
