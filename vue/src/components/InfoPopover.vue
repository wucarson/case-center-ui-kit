<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import Icon from './Icon.vue';
import { cx, useFocusVisible, type StyleProp } from './util';

/** 資訊提示：滑過 150ms 打開、點擊釘住、Esc 關閉。氣泡箭頭對準 ⓘ。說明文字用預設插槽。 */
const props = withDefaults(defineProps<{
  /** 標籤（ⓘ 放在它後面） */
  label: string;
  /** 說明（也可用預設插槽） */
  children?: string;
  /** 指標值與補充（選用），例：68%、3 / 5 個里程碑 */
  value?: string;
  valueNote?: string;
  defaultOpen?: boolean;
  /** 滑過多久打開（ms，預設 150） */
  openDelay?: number;
  style?: StyleProp;
}>(), { openDelay: 150 });
const open = ref(!!props.defaultOpen);
const pinned = ref(false);
const { focusVisible, onFocus, onBlur } = useFocusVisible();
const root = ref<HTMLElement>();
const btn = ref<HTMLElement>();
const pop = ref<HTMLElement>();
const id = `ip-${Math.random().toString(36).slice(2)}`;
let timer = 0;
// 箭頭位置：ⓘ 的中心（相對氣泡左緣），量法同展示牆
watch(open, async (o) => {
  if (!o) return;
  await nextTick();
  if (btn.value && pop.value) pop.value.style.setProperty('--ax', `${btn.value.offsetLeft + btn.value.offsetWidth / 2 - pop.value.offsetLeft}px`);
}, { immediate: true });
const off = (e: MouseEvent) => { if (!root.value?.contains(e.target as Node)) { pinned.value = false; open.value = false; } };
watch(pinned, (p) => (p ? document.addEventListener('mousedown', off) : document.removeEventListener('mousedown', off)));
onBeforeUnmount(() => { clearTimeout(timer); document.removeEventListener('mousedown', off); });
const enter = () => { clearTimeout(timer); timer = window.setTimeout(() => { open.value = true; }, props.openDelay); };
const leave = () => { clearTimeout(timer); if (!pinned.value) open.value = false; };
const toggle = () => { pinned.value = !pinned.value; open.value = pinned.value; };
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  if (e.key === 'Escape') { pinned.value = false; open.value = false; }
};
</script>

<template>
  <div ref="root" class="ip" :style="style"><div class="ip-l">{{ label }}<span ref="btn" :class="cx('ip-b', focusVisible && 'fc')" role="button" tabindex="0" :aria-label="`${label}：說明`" :aria-expanded="open" :aria-describedby="open ? id : undefined" @mouseenter="enter" @mouseleave="leave" @click="toggle" @keydown="onKey" @focus="onFocus" @blur="onBlur"><Icon name="info" /></span></div><div v-if="value !== undefined" class="ip-v">{{ value }}<small v-if="valueNote">{{ valueNote }}</small></div><div v-if="open" :id="id" ref="pop" class="ip-p show" role="tooltip"><slot>{{ children }}</slot></div></div>
</template>
