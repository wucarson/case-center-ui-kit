<script setup lang="ts">
import { ref } from 'vue';
import { focusMenuItem, isMenuItemOff, menuItemClass, menuKey, menuSelect, type MenuItem } from '@case-center/core/menu';
import Icon from './Icon.vue';

export type { MenuItem };

/** 選單清單（.mn-p）。↑↓ 移動（停用項也停得到，才念得到原因）、Enter 選取、Esc 關閉。規則在 core/menu.ts。 */
const props = defineProps<{ items: MenuItem[]; inline?: boolean; ariaLabel?: string; panelStyle?: Record<string, string | number> }>();
const emit = defineEmits<{ close: [] }>();
const cursor = ref(-1);
const root = ref<HTMLElement>();
const select = (it: MenuItem) => { if (menuSelect(it)) emit('close'); };
const onKey = (e: KeyboardEvent) => {
  const r = menuKey(props.items, cursor.value, e.key);
  if (!r) return;
  e.preventDefault();
  if (r.type === 'move') { cursor.value = r.index; if (root.value) focusMenuItem(root.value, props.items, r.index); }
  else if (r.type === 'select') select(props.items[r.index]);
  else emit('close');
};
</script>

<template>
  <div v-if="inline" class="mn pin"><div ref="root" class="mn-p" role="menu" :aria-label="ariaLabel" :style="panelStyle" @keydown="onKey"><template v-for="(it, i) in items" :key="i"><div v-if="it.separator" class="mn-sep" role="separator" /><div v-else role="menuitem" tabindex="-1" :aria-disabled="isMenuItemOff(it) || undefined" :class="menuItemClass(it, i === cursor)" @mouseenter="cursor = i" @mouseleave="cursor = -1" @click="select(it)"><Icon v-if="it.icon" :name="it.icon" />{{ it.label }}<small v-if="it.disabledReason">{{ it.disabledReason }}</small></div></template></div></div>
  <div v-else ref="root" class="mn-p" role="menu" :aria-label="ariaLabel" :style="panelStyle" @keydown="onKey"><template v-for="(it, i) in items" :key="i"><div v-if="it.separator" class="mn-sep" role="separator" /><div v-else role="menuitem" tabindex="-1" :aria-disabled="isMenuItemOff(it) || undefined" :class="menuItemClass(it, i === cursor)" @mouseenter="cursor = i" @mouseleave="cursor = -1" @click="select(it)"><Icon v-if="it.icon" :name="it.icon" />{{ it.label }}<small v-if="it.disabledReason">{{ it.disabledReason }}</small></div></template></div>
</template>
