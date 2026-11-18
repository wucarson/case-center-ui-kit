<script setup lang="ts">
import { ref } from 'vue';
import { burst } from '../../../shared/burst';
import { cx, type StyleProp } from './util';

/** 追蹤星號：點一下追蹤（填滿＋星光）、再點取消。Enter／空白鍵切換。v-model:on */
const props = defineProps<{
  on: boolean;
  /** 讀屏名稱，例：「追蹤案件」 */
  label: string;
  style?: StyleProp;
}>();
const emit = defineEmits<{ 'update:on': [boolean] }>();
const root = ref<HTMLElement>();
const toggle = () => { if (!props.on && root.value) burst(root.value); emit('update:on', !props.on); };
const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
</script>

<template>
  <span ref="root" :class="cx('starb', on && 'on')" :style="style" role="button" tabindex="0" :aria-pressed="on" :aria-label="label" @click="toggle" @keydown="onKey"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z" /></svg></span>
</template>
