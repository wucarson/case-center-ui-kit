<script setup lang="ts">
import { computed } from 'vue';
import { pageItems } from '../../../shared/pages';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

/** 分頁：頁數多時頭尾固定、中間收成 …；第一頁停用「‹」、最後一頁停用「›」。v-model:page、v-model:pageSize */
const props = withDefaults(defineProps<{
  /** 總筆數 */
  total: number;
  /** 目前頁，從 1 開始 */
  page: number;
  pageSize: number;
  /** 每頁筆數的選項 */
  sizes?: number[];
  /** 單位，例：「人」 */
  unit?: string;
  /** 頁碼區的讀屏名稱 */
  label?: string;
  /** 左邊「每頁 N 筆，共 M 筆」；空間不夠時關掉 */
  showSize?: boolean;
  style?: StyleProp;
}>(), { sizes: () => [20, 50], unit: '筆', label: '分頁', showSize: true });
const emit = defineEmits<{ 'update:page': [number]; 'update:pageSize': [number] }>();
const pages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
const items = computed(() => pageItems(props.page, pages.value));
const go = (p: number) => { if (p >= 1 && p <= pages.value && p !== props.page) emit('update:page', p); };
const onKey = (e: KeyboardEvent, p: number) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(p); } };
const prevOff = computed(() => props.page <= 1);
const nextOff = computed(() => props.page >= pages.value);
</script>

<template>
  <div class="pg" :style="style"><span v-if="showSize">每頁<span class="sel" style="position: relative">{{ pageSize }}<Icon name="chevronDown" /><select aria-label="每頁筆數" :value="pageSize" style="position: absolute; inset: 0; width: 100%; opacity: 0; cursor: pointer" @change="emit('update:pageSize', Number(($event.target as HTMLSelectElement).value))"><option v-for="n in sizes" :key="n" :value="n">{{ n }}</option></select></span>{{ unit }}，共 <b>{{ total }}</b> {{ unit }}</span><nav :aria-label="label"><span role="button" :tabindex="prevOff ? -1 : 0" aria-label="上一頁" :aria-disabled="prevOff || undefined" :class="prevOff ? 'dis' : undefined" @click="go(page - 1)" @keydown="onKey($event, page - 1)">‹</span><template v-for="(p, i) in items" :key="p ?? 'g' + i"><span v-if="p === null" class="gap" aria-hidden="true">…</span><span v-else role="button" tabindex="0" :aria-label="`第 ${p} 頁`" :aria-current="p === page ? 'page' : undefined" :class="p === page ? 'on' : undefined" @click="go(p)" @keydown="onKey($event, p)">{{ p }}</span></template><span role="button" :tabindex="nextOff ? -1 : 0" aria-label="下一頁" :aria-disabled="nextOff || undefined" :class="nextOff ? 'dis' : undefined" @click="go(page + 1)" @keydown="onKey($event, page + 1)">›</span></nav></div>
</template>
