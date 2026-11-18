<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { cx } from './util';

/** 確認對話框：需要確認才繼續。Esc＝取消；Tab 只在兩顆按鈕間移動。 */
const props = withDefaults(defineProps<{
  open: boolean;
  /** 與觸發按鈕同名，不寫「確定要…嗎？」 */
  title: string;
  body: string;
  /** 補充說明，較弱字色（例：影響範圍） */
  note?: string;
  /** 確認鈕文字，通常與標題相同 */
  confirmLabel?: string;
  cancelLabel?: string;
  /** 破壞性：確認鈕紅底，焦點先在取消 */
  destructive?: boolean;
  /** 只畫對話框本體、不浮起（展示、文件用） */
  inline?: boolean;
  initialFocus?: 'confirm' | 'cancel' | 'none';
}>(), { cancelLabel: '取消' });
const emit = defineEmits<{ confirm: []; cancel: [] }>();
const card = ref<HTMLElement>();
const fv = ref<'ok' | 'cancel' | null>(null);
const focusKey = computed(() => props.initialFocus ?? (props.destructive ? 'cancel' : 'confirm'));
let prev: HTMLElement | null = null;
watch(() => props.open, async (o) => {
  if (props.inline || focusKey.value === 'none') return;
  if (o) { prev = document.activeElement as HTMLElement | null; await nextTick(); card.value?.querySelector<HTMLElement>(focusKey.value === 'cancel' ? '.cancel' : '.ok')?.focus(); }
  else prev?.focus?.();
}, { immediate: true });
const onFocus = (e: FocusEvent, k: 'ok' | 'cancel') => { fv.value = (e.currentTarget as HTMLElement).matches(':focus-visible') ? k : null; };
const act = (k: 'ok' | 'cancel') => (k === 'ok' ? emit('confirm') : emit('cancel'));
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') { e.preventDefault(); emit('cancel'); }
  if (e.key === 'Tab') {
    const f = [...(card.value?.querySelectorAll<HTMLElement>('[role="button"]') ?? [])];
    const i = f.indexOf(document.activeElement as HTMLElement);
    e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length]?.focus();
  }
};
</script>

<template>
  <template v-if="open">
    <div v-if="inline" ref="card" :class="cx('dl-d', 'pin')" role="dialog" aria-labelledby="cc-dl-t" @keydown="onKey"><b id="cc-dl-t">{{ title }}</b><p><span>{{ body }}</span><small v-if="note">{{ note }}</small></p><div class="dl-a"><span :class="cx('cancel', fv === 'cancel' && 'fc')" role="button" tabindex="0" @click="act('cancel')" @keydown.enter.space.prevent="act('cancel')" @focus="onFocus($event, 'cancel')" @blur="fv = null">{{ cancelLabel }}</span><span :class="cx('ok', destructive && 'dng', fv === 'ok' && 'is-focus')" role="button" tabindex="0" @click="act('ok')" @keydown.enter.space.prevent="act('ok')" @focus="onFocus($event, 'ok')" @blur="fv = null">{{ confirmLabel ?? title }}</span></div></div>
    <Teleport v-else to="body"><div class="dl open" style="position: fixed; inset: 0; z-index: 1000; border-radius: 0"><i class="dl-bd" @click="emit('cancel')" /><div ref="card" class="dl-d" role="dialog" aria-modal="true" aria-labelledby="cc-dl-t" @keydown="onKey"><b id="cc-dl-t">{{ title }}</b><p><span>{{ body }}</span><small v-if="note">{{ note }}</small></p><div class="dl-a"><span :class="cx('cancel', fv === 'cancel' && 'fc')" role="button" tabindex="0" @click="act('cancel')" @keydown.enter.space.prevent="act('cancel')" @focus="onFocus($event, 'cancel')" @blur="fv = null">{{ cancelLabel }}</span><span :class="cx('ok', destructive && 'dng', fv === 'ok' && 'is-focus')" role="button" tabindex="0" @click="act('ok')" @keydown.enter.space.prevent="act('ok')" @focus="onFocus($event, 'ok')" @blur="fv = null">{{ confirmLabel ?? title }}</span></div></div></div></Teleport>
  </template>
</template>
