<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { onOutsidePointer } from '@wucarson/facet-core/dom';
import { MENU_FLOAT_STYLE, focusFirstMenuItem, menuTriggerClass } from '@wucarson/facet-core/menu';
import Icon from './Icon.vue';
import MenuPanel, { type MenuItem } from './MenuPanel.vue';

/** 操作選單：⋯ 收起次要動作。觸發鈕＋浮起的清單（靠右對齊）。規則在 core/menu.ts。 */
const props = defineProps<{
  items: MenuItem[];
  /** 觸發鈕的讀屏名稱，例：「更多操作：現場設備異常排查」 */
  label: string;
  defaultOpen?: boolean;
}>();
const open = ref(!!props.defaultOpen);
const root = ref<HTMLElement>();
const btn = ref<HTMLButtonElement>();
let off: (() => void) | null = null;
const detach = () => { off?.(); off = null; };
watch(open, async (o) => {
  detach();
  if (!o) return;
  await nextTick();
  if (!root.value) return;
  off = onOutsidePointer(root.value, () => { open.value = false; });
  focusFirstMenuItem(root.value);
}, { immediate: true });
onBeforeUnmount(detach);
const close = () => { open.value = false; btn.value?.focus(); };
</script>

<template>
  <div ref="root" class="mn-h" style="position: relative"><button ref="btn" type="button" :class="menuTriggerClass(open)" :aria-label="label" aria-haspopup="menu" :aria-expanded="open" @click="open = !open"><Icon name="dots" /></button><MenuPanel v-if="open && items.length > 0" :items="items" :aria-label="label" :panel-style="MENU_FLOAT_STYLE" @close="close" /></div>
</template>
