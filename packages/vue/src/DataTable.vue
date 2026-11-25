<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { flipRows, measureRows, nextSort, rowClass, sortRows, thState, type TableColumn, type TableSort } from '@case-center/core/table';
import DueCell from './DueCell.vue';
import SortTh from './SortTh.vue';
import type { StyleProp } from './util';

export type TableRow = Record<string, string | number | boolean | undefined> & { key?: string; closed?: boolean };

/** 資料表格：點表頭排序，換順序時各列滑到新位置；到期欄自動標逾期與即將到期。v-model:sort。規則在 core/table.ts。 */
const props = withDefaults(defineProps<{
  /** 表格名稱（讀屏用） */
  label: string;
  columns: TableColumn[];
  rows: TableRow[];
  /** 排序狀態；沒給就由表格自己記 */
  sort?: TableSort;
  /** 欄寬（grid-template-columns），預設照展示牆 */
  cols?: string;
  /** 顯示表頭列 */
  header?: boolean;
  /** 到期欄的「今天」 */
  today?: string;
  style?: StyleProp;
}>(), { header: true });
const emit = defineEmits<{ 'update:sort': [TableSort] }>();
const own = ref<TableSort>({ key: null, dir: 'asc' });
const cur = computed(() => props.sort ?? own.value);
const root = ref<HTMLElement>();
const keyOf = (r: TableRow) => String(r.key ?? r[props.columns[0]?.key]);
const sorted = computed(() => sortRows(props.rows, cur.value));
const grid = computed(() => (props.cols ? { gridTemplateColumns: props.cols } : undefined));
let before = new Map<string, DOMRect>();
watch(() => sorted.value.map(keyOf).join('|'), async () => { await nextTick(); flipRows(root.value, before); before = new Map(); });
const sortBy = (key: string) => {
  before = measureRows(root.value);
  const next = nextSort(cur.value, key);
  if (!props.sort) own.value = next;
  emit('update:sort', next);
};
</script>

<template>
  <div ref="root" class="tb" role="table" :aria-label="label" :style="style as any"><div v-if="header" :class="rowClass(true)" role="row" :style="grid"><template v-for="c in columns" :key="c.key"><SortTh v-if="c.sortable" :label="c.label" :state="thState(cur, c.key)" @sort="sortBy(c.key)" /><span v-else role="columnheader" :class="c.cell === 'nm' ? 'nm' : undefined">{{ c.label }}</span></template></div><div v-for="(r, i) in sorted" :key="keyOf(r)" :data-k="keyOf(r)" :class="rowClass()" role="row" :style="!header && i === 0 ? { ...grid, borderTop: 0 } : grid"><template v-for="c in columns" :key="c.key"><DueCell v-if="c.cell === 'due'" :due="String(r[c.key] ?? '')" :today="today" :closed="!!r.closed" in-row /><span v-else :class="c.cell" role="cell">{{ r[c.key] }}</span></template></div></div>
</template>
