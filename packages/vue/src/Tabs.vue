<script setup lang="ts">
import { ref } from 'vue';
import { focusNth } from '@case-center/core/choice';
import { tabClass, tabsKey } from '@case-center/core/tabs';
import type { StyleProp } from './util';

/** 頁籤：同一頁內切換平行內容，可帶數量。左右鍵切換、Home／End 跳頭尾。v-model:value（選中的 key）。規則在 core/tabs.ts。 */
const props = defineProps<{
  /** count：有意義才給（「全部」通常不給） */
  tabs: { key: string; label: string; count?: number }[];
  value: string;
  style?: StyleProp;
}>();
const emit = defineEmits<{ 'update:value': [string] }>();
const root = ref<HTMLElement>();
const onKey = (e: KeyboardEvent, i: number) => {
  const j = tabsKey(e.key, i, props.tabs.length);
  if (j < 0) return;
  e.preventDefault();
  emit('update:value', props.tabs[j].key);
  if (root.value) focusNth(root.value, '[role="tab"]', j);
};
</script>

<template>
  <div ref="root" class="tabs" :style="style" role="tablist"><span v-for="(t, i) in tabs" :key="t.key" :class="tabClass(t.key === value)" role="tab" :aria-selected="t.key === value" :tabindex="t.key === value ? 0 : -1" @click="emit('update:value', t.key)" @keydown="onKey($event, i)">{{ t.label }}<b v-if="t.count != null">{{ t.count }}</b></span></div>
</template>
