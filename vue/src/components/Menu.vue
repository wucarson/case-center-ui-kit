<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import Icon from './Icon.vue';
import MenuPanel, { type MenuItem } from './MenuPanel.vue';
import { cx } from './util';

/** 操作選單：⋯ 收起次要動作。觸發鈕＋浮起的清單（靠右對齊）。 */
const props = defineProps<{
  items: MenuItem[];
  /** 觸發鈕的讀屏名稱，例：「更多操作：現場設備異常排查」 */
  label: string;
  defaultOpen?: boolean;
}>();
const open = ref(!!props.defaultOpen);
const root = ref<HTMLElement>();
const btn = ref<HTMLButtonElement>();
const off = (e: MouseEvent) => { if (!root.value?.contains(e.target as Node)) open.value = false; };
watch(open, async (o) => {
  if (!o) { document.removeEventListener('mousedown', off); return; }
  document.addEventListener('mousedown', off);
  await nextTick();
  root.value?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
}, { immediate: true });
onBeforeUnmount(() => document.removeEventListener('mousedown', off));
const close = () => { open.value = false; btn.value?.focus(); };
</script>

<template>
  <div ref="root" class="mn-h" style="position: relative"><button ref="btn" type="button" :class="cx('b2', 'ico', open && 'on')" :aria-label="label" aria-haspopup="menu" :aria-expanded="open" @click="open = !open"><Icon name="dots" /></button><MenuPanel v-if="open && items.length > 0" :items="items" :aria-label="label" :panel-style="{ width: '210px', opacity: 1, transform: 'none', zIndex: 20 }" @close="close" /></div>
</template>
