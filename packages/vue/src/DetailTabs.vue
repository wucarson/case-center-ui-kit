<script setup lang="ts">
import { ref } from 'vue';
import { focusNth } from '@case-center/core/choice';
import { detailTabAriaLabel, detailTabClass, detailTabSeparator, tabsKey } from '@case-center/core/tabs';
import type { FillIconName } from '@case-center/core/icons';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

export interface DetailTabItem {
  key: string;
  label: string;
  /** 線條＋填滿兩版都有的圖示（選中時換填滿） */
  icon: FillIconName;
  /** 數量；null／省略就不顯示 */
  count?: number | null;
  /** 數量的意思不明顯時給讀屏念的說法，例：「3 件未結」 */
  srCount?: string;
}

/** 詳情頁籤：圖示＋名稱＋數量，選中時淡主色底、圖示填滿。左右鍵切換、Home／End 跳頭尾。v-model:value。規則在 core/tabs.ts。 */
const props = withDefaults(defineProps<{
  tabs: DetailTabItem[];
  value: string;
  /** 從這幾個 key 開始新的一組，前面畫分隔線 */
  groupStarts?: string[];
  /** 讀屏名稱，例：「專案內容」 */
  label?: string;
  style?: StyleProp;
}>(), { groupStarts: () => [] });
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
  <div ref="root" class="dt" :style="style" role="tablist" :aria-label="label"><template v-for="(t, i) in tabs" :key="t.key"><i v-if="detailTabSeparator(i, t.key, groupStarts)" class="sep" aria-hidden="true" /><span :class="detailTabClass(t.key === value)" role="tab" :aria-selected="t.key === value" :aria-label="detailTabAriaLabel(t) ?? undefined" :tabindex="t.key === value ? 0 : -1" @click="emit('update:value', t.key)" @keydown="onKey($event, i)"><Icon :name="t.icon" class="ln" /><Icon :name="t.icon" fill />{{ t.label }}<b v-if="t.count != null">{{ t.count }}</b></span></template></div>
</template>
