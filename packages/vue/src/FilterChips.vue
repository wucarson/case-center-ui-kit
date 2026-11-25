<script setup lang="ts">
import { ref } from 'vue';
import { focusNth } from '@wucarson/facet-core/choice';
import { chipExit, chipFocusAfter, chipRemoveLabel, chipsLabel, withoutAt } from '@wucarson/facet-core/chips';
import { isActivateKey } from '@wucarson/facet-core/dom';
import type { StyleProp } from './util';

/** 篩選標籤：目前套用的篩選條件，可逐一移除（縮小淡出，焦點移到下一個）。v-model:items。規則在 core/chips.ts。 */
const props = defineProps<{
  /** 目前套用的條件 */
  items: string[];
  ariaLabel?: string;
  style?: StyleProp;
}>();
const emit = defineEmits<{ 'update:items': [string[]] }>();
const box = ref<HTMLElement>();
const X = '<path d="M6 6l12 12M18 6L6 18"/>';
const remove = async (i: number, keyboard: boolean) => {
  await chipExit(box.value?.children[i]);
  emit('update:items', withoutAt(props.items, i));
  const f = chipFocusAfter(i, props.items.length);
  if (keyboard && f >= 0) requestAnimationFrame(() => box.value && focusNth(box.value, '.chip u', f));
};
const onKey = (e: KeyboardEvent, i: number) => { if (isActivateKey(e.key)) { e.preventDefault(); remove(i, true); } };
</script>

<template>
  <div ref="box" class="chips" role="list" :aria-label="ariaLabel ?? chipsLabel" :style="style"><span v-for="(t, i) in items" :key="t" class="chip" role="listitem">{{ t }}<u role="button" tabindex="0" :aria-label="chipRemoveLabel(t)" @click="remove(i, false)" @keydown="onKey($event, i)"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true" v-html="X" /></u></span></div>
</template>
