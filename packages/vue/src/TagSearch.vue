<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import { searchBoxClass, suggestionClass, suggestionId, suggestionListLabel, tagMatches, tagSearchKey, type TagSuggestion } from '@case-center/core/search';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

/** 搜尋與標籤建議：邊打字邊列出相符的標籤；↑↓ 移動、Enter 選取、Esc 收起。v-model:value。規則在 core/search.ts。 */
const props = withDefaults(defineProps<{
  /** 可建議的標籤 */
  tags: TagSuggestion[];
  value?: string;
  /** 讀屏名稱，例：「搜尋公告」 */
  label: string;
  placeholder?: string;
  /** 最多幾個建議（預設 5） */
  max?: number;
  style?: StyleProp;
}>(), { value: '', placeholder: '搜尋公告標題或標籤' });
const emit = defineEmits<{ 'update:value': [string]; pick: [TagSuggestion] }>();
const inputId = useId();
const listId = inputId + '-list';
const query = ref(props.value);
watch(() => props.value, (v) => { query.value = v; });
const focus = ref(false);
const closed = ref(false);
const cursor = ref(0);
const shown = computed(() => tagMatches(props.tags, query.value, props.max));
const open = computed(() => focus.value && !closed.value && shown.value.length > 0);
const set = (v: string) => { query.value = v; closed.value = false; cursor.value = 0; emit('update:value', v); };
const pick = (t: TagSuggestion) => { set(t.label); closed.value = true; emit('pick', t); };
const onKey = (e: KeyboardEvent) => {
  const r = tagSearchKey(open.value, cursor.value, shown.value.length, e.key);
  if (!r) return;
  e.preventDefault();
  if (r.type === 'move') cursor.value = r.index;
  else if (r.type === 'pick') pick(shown.value[r.index]);
  else closed.value = true;
};
</script>

<template>
  <div class="tsr" :style="style"><div :class="searchBoxClass(focus)"><Icon name="search" /><input :id="inputId" class="ff-real" role="combobox" :aria-label="label" :aria-expanded="open" :aria-controls="listId" aria-autocomplete="list" :aria-activedescendant="open ? suggestionId(inputId, cursor) : undefined" autocomplete="off" :placeholder="placeholder" :value="query" @input="set(($event.target as HTMLInputElement).value)" @focus="focus = true" @blur="focus = false" @keydown="onKey" /></div><div v-if="open" :id="listId" class="results show" role="listbox" :aria-label="suggestionListLabel(label)"><div v-for="(t, i) in shown" :id="suggestionId(inputId, i)" :key="t.label" :class="suggestionClass(i === cursor)" role="option" :aria-selected="i === cursor" @mousedown.prevent="pick(t)" @mousemove="cursor = i"><span>{{ t.label }}</span><em v-if="t.count">{{ t.count }}</em></div></div></div>
</template>
