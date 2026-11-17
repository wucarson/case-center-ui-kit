<script setup lang="ts">
import { ref } from 'vue';
import { cx, type StyleProp } from './util';

/** 表單欄位外框：標籤＋輸入框＋說明／錯誤。輸入框聚焦時整框換主色並加光圈。輸入框區用預設插槽。 */
withDefaults(defineProps<{
  label: string;
  /** 必填：標籤後加紅色星號 */
  required?: boolean;
  /** 選填：標籤後加「（選填）」 */
  optional?: boolean;
  /** 唯讀（系統帶入）：不標必填也不標選填 */
  readOnly?: boolean;
  disabled?: boolean;
  /** 必填且尚未填寫：標籤旁顯示「尚未填寫」 */
  empty?: boolean;
  emptyLabel?: string;
  help?: string;
  /** 字數，例：'4 / 50' */
  counter?: string;
  /** 錯誤訊息：位置先留好，出現時欄位不跳動 */
  error?: string;
  /** 多行（輸入框較高、文字靠上） */
  multiline?: boolean;
  htmlFor?: string;
  style?: StyleProp;
}>(), { emptyLabel: '尚未填寫' });
const focus = ref(false);
const onFocusOut = (e: FocusEvent) => { if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) focus.value = false; };
const SR = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
</script>

<template>
  <div :class="cx('ff', readOnly && 'ro', !!error && 'bad', disabled && 'dis', focus && !readOnly && !disabled && !error && 'focus')" :style="style" @focusin="focus = true" @focusout="onFocusOut"><label class="ff-l" :for="htmlFor">{{ label }}<template v-if="!readOnly"><span v-if="required" class="req" aria-hidden="true">*</span><span v-else-if="optional" class="opt">（選填）</span></template><span v-if="required" :style="SR">必填</span><span v-if="empty" class="ff-e">{{ emptyLabel }}</span></label><div :class="cx('ff-i', multiline && 'ta')"><slot /></div><div v-if="!error" class="ff-h"><span>{{ help }}</span><span v-if="counter" class="cnt" aria-live="polite">{{ counter }}</span></div><div class="ff-x" :role="error ? 'alert' : undefined">{{ error }}</div></div>
</template>
