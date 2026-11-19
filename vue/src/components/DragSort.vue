<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  SORT_STEP, sortAnnounce, sortClampY, sortHandleLabel, sortHeight, sortKey, sortLand, sortMin, sortMove, sortRowClass, sortSlot, sortToggle, sortY,
  type SortItem,
} from '../../../core/sort';
import { cx } from '../../../core/dom';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

/** 拖移排序：拖握把調整順序，其他列滑開讓位，原位留虛線空位；握把聚焦後 ↑↓ 移動。v-model:items。規則在 core/sort.ts。 */
const props = defineProps<{
  /** 目前順序；開頭的 locked 列固定不動 */
  items: SortItem[];
  ariaLabel?: string;
  style?: StyleProp;
}>();
const emit = defineEmits<{ 'update:items': [SortItem[]] }>();
const order = ref<SortItem[]>(props.items);
const held = ref<{ key: string; y: number } | null>(null);
const say = ref('');
const box = ref<HTMLElement>();
watch(() => props.items, (v) => { if (!held.value) order.value = v; });
const n = computed(() => order.value.length);
const min = computed(() => sortMin(order.value));
const index = (key: string) => order.value.findIndex((x) => x.key === key);
const land = (key: string) => requestAnimationFrame(() => sortLand(box.value?.querySelector(`[data-key="${CSS.escape(key)}"]`)));
const commit = (next: SortItem[]) => { order.value = next; emit('update:items', next); };
const GRIP = '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>';
const SR = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';

const onDown = (e: PointerEvent, key: string) => {
  if (e.button !== 0) return;
  const h = e.currentTarget as HTMLElement;
  h.setPointerCapture(e.pointerId);
  const y0 = e.clientY, base = index(key) * SORT_STEP, start = order.value;
  held.value = { key, y: base };
  const move = (ev: PointerEvent) => {
    const y = sortClampY(base + ev.clientY - y0, min.value, n.value), from = index(key), to = sortSlot(y, min.value, n.value);
    if (to !== from) order.value = sortMove(order.value, from, to);
    held.value = { key, y };
  };
  const up = () => {
    h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up);
    held.value = null; land(key);
    if (order.value !== start) { emit('update:items', order.value); const i = index(key); say.value = sortAnnounce(order.value[i].label, i, n.value); }
  };
  h.addEventListener('pointermove', move); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
};
const onKey = (e: KeyboardEvent, it: SortItem) => {
  const i = index(it.key), to = sortKey(i, min.value, n.value, e.key);
  if (to === null) return;
  e.preventDefault();
  if (to === i) return;
  commit(sortMove(order.value, i, to)); land(it.key); say.value = sortAnnounce(it.label, to, n.value);
};
const rowOf = (it: SortItem) => order.value[index(it.key)] ?? it;
const rowStyle = (it: SortItem) => ({ transform: sortY(index(it.key), held.value?.key === it.key ? held.value.y : undefined) });
</script>

<template>
  <div ref="box" class="drg" role="list" :aria-label="ariaLabel" :style="[{ height: sortHeight(n) }, style as any]"><i :class="cx('drg-ph', !!held && 'show')" :style="held ? { transform: sortY(index(held.key)) } : undefined" /><div v-for="it in items" :key="it.key" :data-key="it.key" :class="sortRowClass(rowOf(it), held?.key === it.key)" role="listitem" :style="rowStyle(it)"><span v-if="it.locked" class="drg-h lk" title="固定欄位"><Icon name="lock" /></span><button v-else class="drg-h" type="button" :aria-label="sortHandleLabel(it.label, index(it.key), n)" @pointerdown="onDown($event, it.key)" @keydown="onKey($event, it)"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true" v-html="GRIP" /></button><span class="drg-n">{{ it.label }}</span><button class="drg-s" type="button" role="switch" :aria-checked="!!rowOf(it).visible" :aria-label="`顯示${it.label}`" :disabled="it.locked" @click="commit(sortToggle(order, it.key))"><span class="tg"><i /></span></button></div><span role="status" :style="SR">{{ say }}</span></div>
</template>
