<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { IconName } from '@case-center/core/icons';
import Button from './Button.vue';
import Icon from './Icon.vue';
import { cx, type StyleProp } from './util';

export type CalloutTone = 'info' | 'success' | 'warn' | 'danger' | 'neutral';
const CLS: Record<CalloutTone, string> = { info: 'info', success: 'ok', warn: 'warn', danger: 'dng', neutral: 'neu' };
const ICON: Record<CalloutTone, IconName> = { info: 'info', success: 'ok', warn: 'warn', danger: 'error', neutral: 'info' };

/** 提示訊息：頁面內的提示框，不擋操作。內文用預設插槽或 children。操作結果回饋請用 Toast。 */
const props = defineProps<{
  tone: CalloutTone;
  /** 標題：一句話講完 */
  heading: string;
  /** 內文（也可用預設插槽） */
  children?: string;
  /** 需要更醒目時加圖示 */
  icon?: boolean;
  /** 彈窗底部等空間有限處 */
  compact?: boolean;
  /** 明確的下一步，例：{ label: '重試' }（點了發出 action） */
  action?: { label: string };
  /** 操作後才出現、要讓讀屏念出來（danger 一律念） */
  live?: boolean;
  style?: StyleProp;
}>();
const emit = defineEmits<{ action: [] }>();
const slots = useSlots();
const role = computed(() => (props.tone === 'danger' ? 'alert' : props.live ? 'status' : undefined));
</script>

<template>
  <div :class="cx('co', CLS[tone], compact && 'cpt')" :style="style" :role="role"><Icon v-if="icon" :name="ICON[tone]" /><div><strong>{{ heading }}</strong><p v-if="slots.default || children"><slot>{{ children }}</slot></p></div><Button v-if="action" variant="outline" @click="emit('action')">{{ action.label }}</Button></div>
</template>
