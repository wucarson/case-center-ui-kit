<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import {
  DIALOG_OVERLAY_STYLE, dialogCancelClass, dialogClass, dialogFocusKey, dialogKey, dialogOkClass, dialogTitleId, focusDialogButton,
  type DialogButton, type DialogFocus,
} from '@case-center/core/overlay';

/** 確認對話框：需要確認才繼續。Esc＝取消；Tab 只在兩顆按鈕間移動。規則在 core/overlay.ts。 */
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
  initialFocus?: DialogFocus;
}>(), { cancelLabel: '取消' });
const emit = defineEmits<{ confirm: []; cancel: [] }>();
const card = ref<HTMLElement>();
const titleId = dialogTitleId();
const fv = ref<DialogButton | null>(null);
const focusKey = computed(() => dialogFocusKey(props.initialFocus, props.destructive));
let prev: HTMLElement | null = null;
watch(() => props.open, async (o) => {
  if (props.inline || focusKey.value === 'none') return;
  if (o) { prev = document.activeElement as HTMLElement | null; await nextTick(); focusDialogButton(card.value, focusKey.value); }
  else prev?.focus?.();
}, { immediate: true });
const onFocus = (e: FocusEvent, k: DialogButton) => { fv.value = (e.currentTarget as HTMLElement).matches(':focus-visible') ? k : null; };
const act = (k: DialogButton) => (k === 'ok' ? emit('confirm') : emit('cancel'));
const onKey = (e: KeyboardEvent) => { if (dialogKey(card.value, e, () => emit('cancel'))) e.preventDefault(); };
</script>

<template>
  <template v-if="open">
    <div v-if="inline" ref="card" :class="dialogClass(true)" role="dialog" :aria-labelledby="titleId" @keydown="onKey"><b :id="titleId">{{ title }}</b><p><span>{{ body }}</span><small v-if="note">{{ note }}</small></p><div class="dl-a"><span :class="dialogCancelClass(fv)" role="button" tabindex="0" @click="act('cancel')" @keydown.enter.space.prevent="act('cancel')" @focus="onFocus($event, 'cancel')" @blur="fv = null">{{ cancelLabel }}</span><span :class="dialogOkClass(fv, destructive)" role="button" tabindex="0" @click="act('ok')" @keydown.enter.space.prevent="act('ok')" @focus="onFocus($event, 'ok')" @blur="fv = null">{{ confirmLabel ?? title }}</span></div></div>
    <Teleport v-else to="body"><div class="dl open" :style="DIALOG_OVERLAY_STYLE"><i class="dl-bd" @click="emit('cancel')" /><div ref="card" :class="dialogClass(false)" role="dialog" aria-modal="true" :aria-labelledby="titleId" @keydown="onKey"><b :id="titleId">{{ title }}</b><p><span>{{ body }}</span><small v-if="note">{{ note }}</small></p><div class="dl-a"><span :class="dialogCancelClass(fv)" role="button" tabindex="0" @click="act('cancel')" @keydown.enter.space.prevent="act('cancel')" @focus="onFocus($event, 'cancel')" @blur="fv = null">{{ cancelLabel }}</span><span :class="dialogOkClass(fv, destructive)" role="button" tabindex="0" @click="act('ok')" @keydown.enter.space.prevent="act('ok')" @focus="onFocus($event, 'ok')" @blur="fv = null">{{ confirmLabel ?? title }}</span></div></div></div></Teleport>
  </template>
</template>
