<script setup lang="ts">
import { computed, ref } from 'vue';
import type { IconName } from '../../../shared/icons';
import Icon from './Icon.vue';
import { cx } from './util';

export type MenuItem =
  | { separator: true }
  | { separator?: false; label: string; icon?: IconName; danger?: boolean; disabledReason?: string; disabled?: boolean; onSelect?: () => void };

/** 選單清單（.mn-p）。↑↓ 移動（停用項也停得到，才念得到原因）、Enter 選取、Esc 關閉。 */
const props = defineProps<{ items: MenuItem[]; inline?: boolean; ariaLabel?: string; panelStyle?: Record<string, string | number> }>();
const emit = defineEmits<{ close: [] }>();
const cursor = ref(-1);
const root = ref<HTMLElement>();
const idx = computed(() => props.items.map((it, i) => (it.separator ? -1 : i)).filter((i) => i >= 0));
const off = (it: MenuItem) => !it.separator && (it.disabled || !!it.disabledReason);
const focusAt = (i: number) => { cursor.value = i; root.value?.querySelectorAll<HTMLElement>('[role="menuitem"]')[idx.value.indexOf(i)]?.focus(); };
const select = (it: MenuItem) => { if (it.separator || off(it)) return; it.onSelect?.(); emit('close'); };
const onKey = (e: KeyboardEvent) => {
  const list = idx.value, k = list.indexOf(cursor.value);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); focusAt(list[(k + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]); }
  else if (e.key === 'Home') { e.preventDefault(); focusAt(list[0]); }
  else if (e.key === 'End') { e.preventDefault(); focusAt(list[list.length - 1]); }
  else if (e.key === 'Escape') { e.preventDefault(); emit('close'); }
  else if ((e.key === 'Enter' || e.key === ' ') && cursor.value >= 0) { e.preventDefault(); select(props.items[cursor.value]); }
};
</script>

<template>
  <div v-if="inline" class="mn pin"><div ref="root" class="mn-p" role="menu" :aria-label="ariaLabel" :style="panelStyle" @keydown="onKey"><template v-for="(it, i) in items" :key="i"><div v-if="it.separator" class="mn-sep" role="separator" /><div v-else role="menuitem" tabindex="-1" :aria-disabled="off(it) || undefined" :class="cx('mn-i', it.danger && 'dng', off(it) && 'dis', i === cursor && 'hl')" @mouseenter="cursor = i" @mouseleave="cursor = -1" @click="select(it)"><Icon v-if="it.icon" :name="it.icon" />{{ it.label }}<small v-if="it.disabledReason">{{ it.disabledReason }}</small></div></template></div></div>
  <div v-else ref="root" class="mn-p" role="menu" :aria-label="ariaLabel" :style="panelStyle" @keydown="onKey"><template v-for="(it, i) in items" :key="i"><div v-if="it.separator" class="mn-sep" role="separator" /><div v-else role="menuitem" tabindex="-1" :aria-disabled="off(it) || undefined" :class="cx('mn-i', it.danger && 'dng', off(it) && 'dis', i === cursor && 'hl')" @mouseenter="cursor = i" @mouseleave="cursor = -1" @click="select(it)"><Icon v-if="it.icon" :name="it.icon" />{{ it.label }}<small v-if="it.disabledReason">{{ it.disabledReason }}</small></div></template></div>
</template>
