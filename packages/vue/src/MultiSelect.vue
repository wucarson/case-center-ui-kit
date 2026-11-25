<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue';
import { onOutsidePointer } from '@wucarson/facet-core/dom';
import { filterItems, multiClass, multiFooter, multiKey, multiSearchLabel, multiShowCount, multiText, multiTextClass, multiToggle, multiTriggerLabel } from '@wucarson/facet-core/listbox';
import Checkbox from './Checkbox.vue';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

/** 多選下拉：從清單勾選多個；沒選＝全部。按鈕列出已選名稱和數量。v-model:value。規則在 core/listbox.ts。 */
const props = withDefaults(defineProps<{
  options: string[];
  /** 已選；空陣列＝全部 */
  value: string[];
  /** 「部門」「客戶」：按鈕字、搜尋提示、底部說明都用它 */
  noun: string;
  /** 量詞：部門用「個」 */
  unit?: string;
  /** 單選：選一個就生效並關閉 */
  single?: boolean;
  /** 放在 FormField 裡：只輸出文字與箭頭，外框由 FormField 畫 */
  inField?: boolean;
  /** 清單跟在按鈕下方、不浮起 */
  inlineMenu?: boolean;
  defaultOpen?: boolean;
  defaultQuery?: string;
  ariaLabel?: string;
  style?: StyleProp;
}>(), { unit: '個' });
const emit = defineEmits<{ 'update:value': [string[]] }>();
const listId = useId();
const root = ref<HTMLElement>();
const open = ref(!!props.defaultOpen);
const query = ref(props.defaultQuery ?? '');
const shown = computed(() => filterItems(props.options, query.value));
const toggle = (t: string) => { emit('update:value', multiToggle(props.value, t, props.single)); if (props.single) open.value = false; };
let off: (() => void) | undefined;
watch(open, (o) => { off?.(); off = o && root.value ? onOutsidePointer(root.value, () => { open.value = false; }) : undefined; }, { flush: 'post', immediate: true });
onBeforeUnmount(() => off?.());
const onKey = (e: KeyboardEvent) => {
  const r = multiKey(open.value, e.key);
  if (r) { e.preventDefault(); open.value = r === 'open'; }
};
const clear = () => emit('update:value', []);
</script>

<template>
  <template v-if="inField"><span :class="multiTextClass(value)">{{ multiText(value, noun) }}</span><span class="unit" aria-hidden="true"><Icon name="chevronDown" /></span></template>
  <div v-else ref="root" :class="multiClass({ open, inlineMenu })" :style="style"><div class="ms-t" role="combobox" tabindex="0" :aria-expanded="open" :aria-controls="listId" aria-haspopup="listbox" :aria-label="multiTriggerLabel(noun, ariaLabel)" @click="open = !open" @keydown="onKey"><span :class="multiTextClass(value)">{{ multiText(value, noun) }}</span><span v-if="multiShowCount(value, single)" class="ms-n">{{ value.length }}</span><Icon name="chevronDown" /></div><div v-if="open" :id="listId" class="ms-p" role="listbox" :aria-multiselectable="!single"><div class="ms-s"><Icon name="search" /><input v-model="query" :aria-label="multiSearchLabel(noun)" :placeholder="multiSearchLabel(noun)" @keydown="onKey" /></div><div class="ms-l"><Checkbox v-for="t in shown" :key="t" :label="t" :checked="value.includes(t)" @update:checked="toggle(t)" /></div><div class="ms-f"><span>{{ multiFooter(value, noun, unit) }}</span><u role="button" tabindex="0" @click="clear" @keydown.enter.space.prevent="clear">清除</u></div></div></div>
</template>
