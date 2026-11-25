<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { cx, isActivateKey } from '@wucarson/facet-core/dom';
import {
  SIDEBAR_CHEVRON, placeSidebarIndicator, sidebarBrandLabel, sidebarClass, sidebarGroupToggleClass, sidebarHasActive, sidebarInitialOpen,
  sidebarItemClass, sidebarSubClass, sidebarTipTop, toggleAt, type SidebarGroup,
} from '@wucarson/facet-core/sidebar';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

export type { SidebarGroup, SidebarItem } from '@wucarson/facet-core/sidebar';

/** 側邊選單：選中＝淡主色底＋填滿圖示，選中片彈性滑動；群組可收合；可收合成圖示列（滑過顯示名稱）。v-model:value、v-model:collapsed。規則在 core/sidebar.ts。 */
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
const open = ref(sidebarInitialOpen(props.groups));
const tip = ref<{ text: string; top: number } | null>(null);
const list = ref<HTMLElement>();
const ind = ref<HTMLElement>();
const has = computed(() => sidebarHasActive(props.groups, props.value));
watch([() => props.value, () => props.collapsed, open], async () => { await nextTick(); placeSidebarIndicator(list.value, ind.value); }, { immediate: true, deep: true });
const showTip = (e: MouseEvent, text: string) => { if (props.collapsed && list.value) tip.value = { text, top: sidebarTipTop(list.value, e.currentTarget as HTMLElement) }; };
const toggle = (k: number) => { open.value = toggleAt(open.value, k); };
const fold = () => { if (props.collapsible) emit('update:collapsed', !props.collapsed); };
const onKey = (e: KeyboardEvent, fn: () => void) => { if (isActivateKey(e.key)) { e.preventDefault(); fn(); } };
</script>

<template>
  <div :class="sidebarClass(collapsed)" :style="style"><nav class="sd"><div v-if="brand" class="sd-brand" :role="collapsible ? 'button' : undefined" :tabindex="collapsible ? 0 : undefined" :aria-label="collapsible ? sidebarBrandLabel(collapsed) : undefined" :aria-expanded="collapsible ? !collapsed : undefined" @click="fold" @keydown="onKey($event, fold)"><i class="sd-logo">{{ brand.logo }}</i><b>{{ brand.name }}</b></div><div ref="list" class="sd-list"><i v-if="has" ref="ind" class="sd-ind" aria-hidden="true" /><template v-for="(g, k) in groups" :key="k"><template v-if="g.collapsible"><span :class="sidebarGroupToggleClass(open[k])" role="button" tabindex="0" :aria-expanded="open[k]" @click="toggle(k)" @keydown="onKey($event, () => toggle(k))">{{ g.label }}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="SIDEBAR_CHEVRON" /></span><div :class="sidebarSubClass(open[k])"><div><span v-for="it in g.items" :key="it.key" :class="sidebarItemClass(it.key === value)" role="link" tabindex="0" :aria-current="it.key === value ? 'page' : undefined" @click="emit('update:value', it.key)" @keydown="onKey($event, () => emit('update:value', it.key))" @mouseenter="showTip($event, it.label)" @mouseleave="tip = null"><Icon :name="it.icon" class="ln" /><Icon :name="it.icon" fill /><span>{{ it.label }}</span><b v-if="it.count != null">{{ it.count }}</b></span></div></div></template><template v-else><span class="sd-g">{{ g.label }}</span><span v-for="it in g.items" :key="it.key" :class="sidebarItemClass(it.key === value)" role="link" tabindex="0" :aria-current="it.key === value ? 'page' : undefined" @click="emit('update:value', it.key)" @keydown="onKey($event, () => emit('update:value', it.key))" @mouseenter="showTip($event, it.label)" @mouseleave="tip = null"><Icon :name="it.icon" class="ln" /><Icon :name="it.icon" fill /><span>{{ it.label }}</span><b v-if="it.count != null">{{ it.count }}</b></span></template></template></div><div v-if="user" class="sd-me"><i class="av">{{ user.initial }}</i><span>{{ user.name }}</span></div></nav><span v-if="collapsed" :class="cx('sd-tip', tip && 'show')" :style="tip ? { top: tip.top + 'px' } : undefined" aria-hidden="true">{{ tip?.text }}</span></div>
</template>
