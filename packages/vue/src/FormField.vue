<script setup lang="ts">
import { computed, ref } from 'vue';
import { SR_ONLY_STYLE, fieldClass, fieldInputClass, fieldMark, leftField } from '@case-center/core/field';
import type { StyleProp } from './util';

/** 表單欄位外框：標籤＋輸入框＋說明／錯誤。輸入框聚焦時整框換主色並加光圈。輸入框區用預設插槽。規則在 core/field.ts。 */
const props = withDefaults(defineProps<{
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
const mark = computed(() => fieldMark(props));
const onFocusOut = (e: FocusEvent) => { if (leftField(e.currentTarget as HTMLElement, e.relatedTarget)) focus.value = false; };
</script>

<template>
  <div :class="fieldClass({ readOnly, disabled, error, focus })" :style="style" @focusin="focus = true" @focusout="onFocusOut"><label class="ff-l" :for="htmlFor">{{ label }}<span v-if="mark === 'req'" class="req" aria-hidden="true">*</span><span v-else-if="mark === 'opt'" class="opt">（選填）</span><span v-if="required" class="sr-only" :style="SR_ONLY_STYLE">必填</span><span v-if="empty" class="ff-e">{{ emptyLabel }}</span></label><div :class="fieldInputClass(multiline)"><slot /></div><div v-if="!error" class="ff-h"><span>{{ help }}</span><span v-if="counter" class="cnt" aria-live="polite">{{ counter }}</span></div><div class="ff-x" :role="error ? 'alert' : undefined">{{ error }}</div></div>
</template>
