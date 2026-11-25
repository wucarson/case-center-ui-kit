<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue';
import { HOLD_MS, HoldControl, holdClass, holdFill, holdHint, holdText, isHoldKey, type HoldPhase } from '@wucarson/facet-core/hold';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

/** 按住確認：按住一段時間才送出；放開、移出或按 Esc 就取消。鍵盤按住 Space／Enter。@confirm。規則在 core/hold.ts。 */
const props = withDefaults(defineProps<{
  /** 動作名稱，例：「結案」→ 按鈕寫「按住結案」 */
  label: string;
  /** 按住多久（ms，預設 1500） */
  duration?: number;
  /** 下方說明；預設「按住 1.5 秒才會送出」 */
  hint?: string;
  disabled?: boolean;
  /** 固定顯示按住進度 0–1（展示、文件用） */
  progress?: number;
  /** 固定顯示完成（展示、文件用） */
  done?: boolean;
  style?: StyleProp;
}>(), { duration: HOLD_MS });
const emit = defineEmits<{ confirm: [] }>();
const hintId = useId();
const p = ref(0);
const phase = ref<HoldPhase>('idle');
const ctl = new HoldControl((v, ph) => { p.value = v; phase.value = ph; }, () => emit('confirm'), props.duration);
watch(() => props.duration, (d) => { ctl.duration = d; });
onBeforeUnmount(() => ctl.dispose());
const shown = computed<HoldPhase>(() => (props.done ? 'done' : props.progress !== undefined ? 'holding' : phase.value));
const fill = computed(() => holdFill(props.progress ?? p.value) ?? undefined);
const press = () => { if (!props.disabled) ctl.press(); };
const onDown = (e: PointerEvent) => { if (e.button === 0) { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); press(); } };
const onKey = (e: KeyboardEvent) => {
  if (isHoldKey(e.key)) { e.preventDefault(); if (!e.repeat) press(); }
  else if (e.key === 'Escape') ctl.release();
};
const onKeyUp = (e: KeyboardEvent) => { if (isHoldKey(e.key)) ctl.release(); };
</script>

<template>
  <div class="hold-c" :style="style"><button type="button" :class="holdClass(shown, disabled)" :disabled="disabled" :aria-describedby="hintId" @pointerdown="onDown" @pointerup="ctl.release()" @pointercancel="ctl.release()" @lostpointercapture="ctl.release()" @keydown="onKey" @keyup="onKeyUp" @blur="ctl.release()"><i class="fill" :style="fill ? { transform: fill } : undefined" /><i class="bar" :style="fill ? { transform: fill } : undefined" /><span class="roll"><span><Icon v-if="shown === 'done'" name="check" class="draw" />{{ holdText(label, shown) }}</span></span></button><div :id="hintId" class="hold-h">{{ hint ?? holdHint(duration) }}</div></div>
</template>
