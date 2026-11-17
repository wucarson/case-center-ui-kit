<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue';
import Icon from './Icon.vue';
import { cx, type StyleProp } from './util';

/** 下拉選單：從固定清單選一個值；打字可篩選。↑↓ 移動、Enter 選取、Esc 關閉。v-model:value */
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
const root = ref<HTMLElement>();
const open = ref(!!props.defaultOpen);
const query = ref<string | null>(props.defaultQuery ?? null);
const cursor = ref(props.defaultQuery ? 0 : -1);
const shown = computed(() => (query.value ? props.items.filter((t) => t.includes(query.value!)) : props.items));
const close = () => { open.value = false; query.value = null; cursor.value = -1; };
const pick = (t: string) => { emit('update:value', t); close(); };
const off = (e: MouseEvent) => { if (!root.value?.contains(e.target as Node)) close(); };
watch(open, (o) => (o ? document.addEventListener('mousedown', off) : document.removeEventListener('mousedown', off)), { immediate: true });
onBeforeUnmount(() => document.removeEventListener('mousedown', off));
const onInput = (e: Event) => { query.value = (e.target as HTMLInputElement).value; open.value = true; cursor.value = 0; };
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (!open.value) { open.value = true; return; }
    const n = shown.value.length, d = e.key === 'ArrowDown' ? 1 : -1;
    cursor.value = n ? (cursor.value + d + n) % n : -1;
  } else if (e.key === 'Enter' && open.value && shown.value[cursor.value]) { e.preventDefault(); pick(shown.value[cursor.value]); }
  else if (e.key === 'Escape' && open.value) { e.preventDefault(); close(); }
};
</script>

<template>
  <template v-if="inField"><input :id="inputId" role="combobox" :aria-expanded="open" :aria-controls="inputId + '-list'" aria-autocomplete="list" :aria-invalid="invalid || undefined" :aria-label="selfLabelled ? label : undefined" autocomplete="off" :placeholder="placeholder" :value="query ?? value" @input="onInput" @focus="open = true" @keydown="onKey" /><span class="unit" aria-hidden="true"><Icon name="chevronDown" /></span></template>
  <div v-else ref="root" :class="cx('dd', open && 'open', open && inlineMenu && 'pin', invalid && 'bad')" :style="style"><div class="dd-t"><input :id="inputId" role="combobox" :aria-expanded="open" :aria-controls="inputId + '-list'" :aria-activedescendant="open && cursor >= 0 ? `${inputId}-opt-${cursor}` : undefined" aria-autocomplete="list" :aria-invalid="invalid || undefined" :aria-label="selfLabelled ? label : undefined" autocomplete="off" :placeholder="placeholder" :value="query ?? value" @input="onInput" @focus="open = true" @keydown="onKey" /><Icon :name="open ? 'search' : 'chevronDown'" /></div><div v-if="open" :id="inputId + '-list'" class="dd-m" role="listbox" :aria-label="label"><template v-if="shown.length"><div v-for="(t, i) in shown" :id="`${inputId}-opt-${i}`" :key="t" role="option" :aria-selected="t === value" :class="cx(t === value && 'sel', i === cursor && 'hl')" @mousedown.prevent="pick(t)" @mousemove="cursor = i">{{ t }}<Icon name="check" /></div></template><div v-else class="none">沒有符合的選項</div></div></div>
</template>
