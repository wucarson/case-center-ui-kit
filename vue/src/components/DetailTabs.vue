<script setup lang="ts">
import { ref } from 'vue';
import type { FillIconName } from '../../../shared/icons';
import Icon from './Icon.vue';
import { cx, type StyleProp } from './util';

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

/** 詳情頁籤：圖示＋名稱＋數量，選中時淡主色底、圖示填滿。左右鍵切換、Home／End 跳頭尾。v-model:value */
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
  const n = props.tabs.length;
  const j = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
  if (j < 0) return;
  e.preventDefault();
  emit('update:value', props.tabs[j].key);
  root.value?.querySelectorAll<HTMLElement>('[role="tab"]')[j]?.focus();
};
</script>

<template>
  <div ref="root" class="dt" :style="style" role="tablist" :aria-label="label"><template v-for="(t, i) in tabs" :key="t.key"><i v-if="i > 0 && groupStarts.includes(t.key)" class="sep" aria-hidden="true" /><span :class="cx('dtab', t.key === value && 'on')" role="tab" :aria-selected="t.key === value" :aria-label="t.srCount ? `${t.label}，${t.srCount}` : undefined" :tabindex="t.key === value ? 0 : -1" @click="emit('update:value', t.key)" @keydown="onKey($event, i)"><Icon :name="t.icon" class="ln" /><Icon :name="t.icon" fill />{{ t.label }}<b v-if="t.count != null">{{ t.count }}</b></span></template></div>
</template>
