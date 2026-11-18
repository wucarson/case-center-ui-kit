<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { FillIconName } from '../../../shared/icons';
import Icon from './Icon.vue';
import { cx, type StyleProp } from './util';

export interface SidebarItem { key: string; label: string; /** 線條＋填滿兩版都有的圖示（選中時換填滿） */ icon: FillIconName; /** 數量徽章 */ count?: number }
export interface SidebarGroup { label: string; items: SidebarItem[]; /** 可收合的群組 */ collapsible?: boolean; /** 一開始是否展開（預設 true） */ defaultOpen?: boolean }

/** 側邊選單：選中＝淡主色底＋填滿圖示，選中片彈性滑動；群組可收合；可收合成圖示列（滑過顯示名稱）。v-model:value、v-model:collapsed */
const props = defineProps<{
  groups: SidebarGroup[];
  /** 目前頁的 key */
  value?: string;
  /** 收合成圖示列 */
  collapsed?: boolean;
  /** 點品牌列切換收合（要搭配 v-model:collapsed） */
  collapsible?: boolean;
  brand?: { logo: string; name: string };
  user?: { name: string; initial: string };
  style?: StyleProp;
}>();
const emit = defineEmits<{ 'update:value': [string]; 'update:collapsed': [boolean] }>();
const open = ref(props.groups.map((g) => g.defaultOpen !== false));
const tip = ref<{ text: string; top: number } | null>(null);
const list = ref<HTMLElement>();
const ind = ref<HTMLElement>();
const has = computed(() => props.groups.some((g) => g.items.some((it) => it.key === props.value)));
// 選中片：量選中項目的位置（量法同展示牆）
watch([() => props.value, () => props.collapsed, open], async () => {
  await nextTick();
  const on = list.value?.querySelector<HTMLElement>('.sd-it.on');
  if (on && ind.value) { ind.value.style.height = `${on.offsetHeight}px`; ind.value.style.transform = `translateY(${on.offsetTop}px)`; }
}, { immediate: true, deep: true });
const showTip = (e: MouseEvent, text: string) => { const el = e.currentTarget as HTMLElement; if (props.collapsed && list.value) tip.value = { text, top: list.value.offsetTop + el.offsetTop + (el.offsetHeight - 24) / 2 }; };
const toggle = (k: number) => { open.value = open.value.map((v, j) => (j === k ? !v : v)); };
const fold = () => { if (props.collapsible) emit('update:collapsed', !props.collapsed); };
const onKey = (e: KeyboardEvent, fn: () => void) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
</script>

<template>
  <div :class="cx('sd-app', collapsed && 'mini')" :style="style"><nav class="sd"><div v-if="brand" class="sd-brand" :role="collapsible ? 'button' : undefined" :tabindex="collapsible ? 0 : undefined" :aria-label="collapsible ? (collapsed ? '展開側欄' : '收合側欄') : undefined" :aria-expanded="collapsible ? !collapsed : undefined" @click="fold" @keydown="onKey($event, fold)"><i class="sd-logo">{{ brand.logo }}</i><b>{{ brand.name }}</b></div><div ref="list" class="sd-list"><i v-if="has" ref="ind" class="sd-ind" aria-hidden="true" /><template v-for="(g, k) in groups" :key="k"><template v-if="g.collapsible"><span :class="cx('sd-g sd-tg', !open[k] && 'shut')" role="button" tabindex="0" :aria-expanded="open[k]" @click="toggle(k)" @keydown="onKey($event, () => toggle(k))">{{ g.label }}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></span><div :class="cx('sd-sub', !open[k] && 'shut')"><div><span v-for="it in g.items" :key="it.key" :class="cx('sd-it', it.key === value && 'on')" role="link" tabindex="0" :aria-current="it.key === value ? 'page' : undefined" @click="emit('update:value', it.key)" @keydown="onKey($event, () => emit('update:value', it.key))" @mouseenter="showTip($event, it.label)" @mouseleave="tip = null"><Icon :name="it.icon" class="ln" /><Icon :name="it.icon" fill /><span>{{ it.label }}</span><b v-if="it.count != null">{{ it.count }}</b></span></div></div></template><template v-else><span class="sd-g">{{ g.label }}</span><span v-for="it in g.items" :key="it.key" :class="cx('sd-it', it.key === value && 'on')" role="link" tabindex="0" :aria-current="it.key === value ? 'page' : undefined" @click="emit('update:value', it.key)" @keydown="onKey($event, () => emit('update:value', it.key))" @mouseenter="showTip($event, it.label)" @mouseleave="tip = null"><Icon :name="it.icon" class="ln" /><Icon :name="it.icon" fill /><span>{{ it.label }}</span><b v-if="it.count != null">{{ it.count }}</b></span></template></template></div><div v-if="user" class="sd-me"><i class="av">{{ user.initial }}</i><span>{{ user.name }}</span></div></nav><span v-if="collapsed" :class="cx('sd-tip', tip && 'show')" :style="tip ? { top: tip.top + 'px' } : undefined" aria-hidden="true">{{ tip?.text }}</span></div>
</template>
