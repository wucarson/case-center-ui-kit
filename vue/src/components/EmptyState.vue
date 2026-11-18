<script setup lang="ts">
import type { IconName } from '../../../shared/icons';
import Button from './Button.vue';
import Icon from './Icon.vue';
import { cx, type StyleProp } from './util';

export type EmptyTone = 'info' | 'warn' | 'danger';
const ICON: Record<EmptyTone, IconName> = { info: 'emptyList', warn: 'noResult', danger: 'failed' };

/** 空狀態：沒有內容、查無結果或載入失敗時，說明原因並給下一步（點按鈕發出 action）。 */
defineProps<{
  /** info＝還沒有內容；warn＝篩選後查無結果；danger＝載入失敗 */
  tone: EmptyTone;
  heading: string;
  /** 說明下一步 */
  text: string;
  /** 下一步的按鈕文字，例：「新增工單」「清除篩選」「重試」 */
  action?: string;
  style?: StyleProp;
}>();
const emit = defineEmits<{ action: [] }>();
</script>

<template>
  <div :class="cx('es', tone)" :style="style" :role="tone === 'danger' ? 'alert' : 'status'"><span class="es-m"><Icon :name="ICON[tone]" /></span><b>{{ heading }}</b><p>{{ text }}</p><Button v-if="action" variant="outline" @click="emit('action')">{{ action }}</Button></div>
</template>
