<script setup lang="ts">
import { ref } from 'vue';
import { STAR_PATH, isStarToggleKey, starClass } from '../../../core/choice';
import { burst } from '../../../shared/burst';
import type { StyleProp } from './util';

/** 追蹤星號：點一下追蹤（填滿＋星光）、再點取消。Enter／空白鍵切換。v-model:on。規則在 core/choice.ts。 */
const props = defineProps<{
  on: boolean;
  /** 讀屏名稱，例：「追蹤案件」 */
  label: string;
  style?: StyleProp;
}>();
const emit = defineEmits<{ 'update:on': [boolean] }>();
const root = ref<HTMLElement>();
const toggle = () => { if (!props.on && root.value) burst(root.value); emit('update:on', !props.on); };
const onKey = (e: KeyboardEvent) => { if (isStarToggleKey(e.key)) { e.preventDefault(); toggle(); } };
</script>

<template>
  <span ref="root" :class="starClass(on)" :style="style" role="button" tabindex="0" :aria-pressed="on" :aria-label="label" @click="toggle" @keydown="onKey"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="STAR_PATH" /></svg></span>
</template>
