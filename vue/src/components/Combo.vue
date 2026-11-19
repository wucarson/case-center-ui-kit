<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue';
import { onOutsidePointer } from '../../../core/dom';
import { COMBO_EMPTY, comboClass, comboIcon, comboKey, comboListId, comboOptionClass, comboOptionId, filterItems } from '../../../core/listbox';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

/** 下拉選單：從固定清單選一個值；打字可篩選。↑↓ 移動、Enter 選取、Esc 關閉。v-model:value。規則在 core/listbox.ts。 */
const props = withDefaults(defineProps<{
  items: string[];
  value?: string;
  placeholder?: string;
  /** 欄位名稱：給清單與展開鈕念 */
  label: string;
  /** 沒有外部 <label> 時打開，用 label 命名輸入框 */
  selfLabelled?: boolean;
  invalid?: boolean;
  /** 放在 FormField 裡：只輸出輸入框與箭頭，外框由 FormField 畫 */
  inField?: boolean;
  /** 清單跟在欄位下方、不浮起（放在對話框、面板裡） */
  inlineMenu?: boolean;
  defaultOpen?: boolean;
  defaultQuery?: string;
  id?: string;
  style?: StyleProp;
}>(), { value: '' });
const emit = defineEmits<{ 'update:value': [string] }>();
const auto = useId();
const inputId = computed(() => props.id ?? auto);
const listId = computed(() => comboListId(inputId.value));
const root = ref<HTMLElement>();
const open = ref(!!props.defaultOpen);
const query = ref<string | null>(props.defaultQuery ?? null);
const cursor = ref(props.defaultQuery ? 0 : -1);
const shown = computed(() => filterItems(props.items, query.value));
const close = () => { open.value = false; query.value = null; cursor.value = -1; };
const pick = (t: string) => { emit('update:value', t); close(); };
let off: (() => void) | undefined;
watch(open, (o) => { off?.(); off = o && root.value ? onOutsidePointer(root.value, close) : undefined; }, { flush: 'post', immediate: true });
onBeforeUnmount(() => off?.());
const onInput = (e: Event) => { query.value = (e.target as HTMLInputElement).value; open.value = true; cursor.value = 0; };
const onKey = (e: KeyboardEvent) => {
  const r = comboKey(open.value, cursor.value, shown.value.length, e.key);
  if (!r) return;
  e.preventDefault();
  if (r.type === 'open') open.value = true;
  else if (r.type === 'move') cursor.value = r.index;
  else if (r.type === 'pick') pick(shown.value[r.index]);
  else close();
};
const active = computed(() => (open.value && cursor.value >= 0 ? comboOptionId(inputId.value, cursor.value) : undefined));
</script>

<template>
  <template v-if="inField"><input :id="inputId" role="combobox" :aria-expanded="open" :aria-controls="listId" :aria-activedescendant="active" aria-autocomplete="list" :aria-invalid="invalid || undefined" :aria-label="selfLabelled ? label : undefined" autocomplete="off" :placeholder="placeholder" :value="query ?? value" @input="onInput" @focus="open = true" @keydown="onKey" /><span class="unit" aria-hidden="true"><Icon name="chevronDown" /></span></template>
  <div v-else ref="root" :class="comboClass({ open, inlineMenu, invalid })" :style="style"><div class="dd-t"><input :id="inputId" role="combobox" :aria-expanded="open" :aria-controls="listId" :aria-activedescendant="active" aria-autocomplete="list" :aria-invalid="invalid || undefined" :aria-label="selfLabelled ? label : undefined" autocomplete="off" :placeholder="placeholder" :value="query ?? value" @input="onInput" @focus="open = true" @keydown="onKey" /><Icon :name="comboIcon(open)" /></div><div v-if="open" :id="listId" class="dd-m" role="listbox" :aria-label="label"><template v-if="shown.length"><div v-for="(t, i) in shown" :id="comboOptionId(inputId, i)" :key="t" role="option" :aria-selected="t === value" :class="comboOptionClass(t === value, i === cursor) || undefined" @mousedown.prevent="pick(t)" @mousemove="cursor = i">{{ t }}<Icon name="check" /></div></template><div v-else class="none">{{ COMBO_EMPTY }}</div></div></div>
</template>
