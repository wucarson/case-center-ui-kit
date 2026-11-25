<script setup lang="ts">
import { isSortKey, thLabel, type ThState } from '@case-center/core/table';

/** 排序表頭：顯示升冪／降冪箭頭；表格裡是 columnheader，可聚焦，點擊或 Enter／Space 觸發 sort。 */
const props = defineProps<{ label: string; state: ThState }>();
const emit = defineEmits<{ sort: [] }>();
const aria = () => (props.state === 'none' ? 'none' : props.state === 'asc' ? 'ascending' : 'descending');
const onKey = (e: KeyboardEvent) => { if (isSortKey(e.key)) { e.preventDefault(); emit('sort'); } };
</script>

<template>
  <span class="th" :data-s="state" role="columnheader" tabindex="0" :aria-sort="aria()" :aria-label="thLabel(label, state)" @click="emit('sort')" @keydown="onKey">{{ label }}<svg viewBox="0 0 12 14" aria-hidden="true"><path class="up" d="M6 1l4 5H2z" /><path class="dn" d="M6 13l4-5H2z" /></svg></span>
</template>
