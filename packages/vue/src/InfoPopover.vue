<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { cx, onOutsidePointer } from '@wucarson/facet-core/dom';
import { PopoverControl, placePopoverArrow, popoverButtonLabel, popoverId, popoverKey } from '@wucarson/facet-core/overlay';
import Icon from './Icon.vue';
import { useFocusVisible, type StyleProp } from './util';

/** 資訊提示：滑過 150ms 打開、點擊釘住、Esc 關閉。氣泡箭頭對準 ⓘ。說明文字用預設插槽。規則在 core/overlay.ts。 */
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
const ctl = new PopoverControl((o, p) => { open.value = o; pinned.value = p; }, !!props.defaultOpen, props.openDelay);
watch(() => props.openDelay, (d) => { ctl.delay = d; });
const { focusVisible, onFocus, onBlur } = useFocusVisible();
const root = ref<HTMLElement>();
const btn = ref<HTMLElement>();
const pop = ref<HTMLElement>();
const id = popoverId();
watch(open, async (o) => { if (!o) return; await nextTick(); placePopoverArrow(btn.value, pop.value); }, { immediate: true });
let off: (() => void) | undefined;
watch(pinned, (p) => { off?.(); off = p && root.value ? onOutsidePointer(root.value, () => ctl.close()) : undefined; });
onBeforeUnmount(() => { ctl.dispose(); off?.(); });
const onKey = (e: KeyboardEvent) => {
  const r = popoverKey(e.key);
  if (r === 'toggle') { e.preventDefault(); ctl.toggle(); }
  else if (r === 'close') ctl.close();
};
</script>

<template>
  <div ref="root" class="ip" :style="style"><div class="ip-l">{{ label }}<span ref="btn" :class="cx('ip-b', focusVisible && 'fc')" role="button" tabindex="0" :aria-label="popoverButtonLabel(label)" :aria-expanded="open" :aria-describedby="open ? id : undefined" @mouseenter="ctl.enter()" @mouseleave="ctl.leave()" @click="ctl.toggle()" @keydown="onKey" @focus="onFocus" @blur="onBlur"><Icon name="info" /></span></div><div v-if="value !== undefined" class="ip-v">{{ value }}<small v-if="valueNote">{{ valueNote }}</small></div><div v-if="open" :id="id" ref="pop" class="ip-p show" role="tooltip"><slot>{{ children }}</slot></div></div>
</template>
