<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue';
import Checkbox from './Checkbox.vue';
import Icon from './Icon.vue';
import { cx, type StyleProp } from './util';

/** 多選下拉：從清單勾選多個；沒選＝全部。按鈕列出已選名稱和數量。v-model:value */
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
const shown = computed(() => (query.value ? props.options.filter((t) => t.includes(query.value)) : props.options));
const any = computed(() => `全部${props.noun}`);
const text = computed(() => (props.value.length ? props.value.join('、') : any.value));
const toggle = (t: string) => {
  if (props.single) { emit('update:value', [t]); open.value = false; return; }
  emit('update:value', props.value.includes(t) ? props.value.filter((x) => x !== t) : [...props.value, t]);
};
const off = (e: MouseEvent) => { if (!root.value?.contains(e.target as Node)) open.value = false; };
watch(open, (o) => (o ? document.addEventListener('mousedown', off) : document.removeEventListener('mousedown', off)), { immediate: true });
onBeforeUnmount(() => document.removeEventListener('mousedown', off));
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && open.value) { e.preventDefault(); open.value = false; }
  if ((e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') && !open.value) { e.preventDefault(); open.value = true; }
};
const clear = () => emit('update:value', []);
</script>

<template>
  <template v-if="inField"><span :class="value.length ? '' : 'ph'">{{ text }}</span><span class="unit" aria-hidden="true"><Icon name="chevronDown" /></span></template>
  <div v-else ref="root" :class="cx('ms', open && 'open', open && inlineMenu && 'pin')" :style="style"><div class="ms-t" role="combobox" tabindex="0" :aria-expanded="open" :aria-controls="listId" aria-haspopup="listbox" :aria-label="ariaLabel ?? `篩選${noun}`" @click="open = !open" @keydown="onKey"><span :class="value.length ? '' : 'ph'">{{ text }}</span><span v-if="!single && value.length > 0" class="ms-n">{{ value.length }}</span><Icon name="chevronDown" /></div><div v-if="open" :id="listId" class="ms-p" role="listbox" :aria-multiselectable="!single"><div class="ms-s"><Icon name="search" /><input v-model="query" :aria-label="`搜尋${noun}`" :placeholder="`搜尋${noun}`" @keydown="onKey" /></div><div class="ms-l"><Checkbox v-for="t in shown" :key="t" :label="t" :checked="value.includes(t)" @update:checked="toggle(t)" /></div><div class="ms-f"><span>{{ value.length ? `已選 ${value.length} ${unit}` : `未選＝${any}` }}</span><u role="button" tabindex="0" @click="clear" @keydown.enter.space.prevent="clear">清除</u></div></div></div>
</template>
