<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { IconName } from '../../../shared/icons';
import Icon from './Icon.vue';
import { cx, type StyleProp } from './util';

/**
 * 按鈕。只有圖示時一定要給 aria-label。
 *   <Button>儲存變更</Button>
 *   <Button variant="outline" size="lg">取消</Button>
 *   <Button variant="destructive" size="lg" icon="trash">刪除</Button>
 */
const props = withDefaults(defineProps<{
  /** primary＝畫面最重要的一個動作；outline＝一般；destructive＝不可復原；ghost＝工具列、表格內 */
  variant?: 'primary' | 'outline' | 'destructive' | 'ghost';
  /** lg＝48（表單送出、頁首）；sm＝32（工具列、卡片內）。預設：primary 為 lg，其餘為 sm */
  size?: 'lg' | 'sm';
  icon?: IconName;
  /** 送出中：轉圈＋停用 */
  loading?: boolean;
  /** 完成：轉成成功色 */
  done?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: StyleProp;
  /** 文字（也可用預設插槽） */
  children?: string;
}>(), { variant: 'primary', type: 'button' });

const slots = useSlots();
const text = computed(() => props.children);
const iconOnly = computed(() => !!props.icon && !slots.default && !text.value);
const cls = computed(() => {
  const primary = props.variant === 'primary';
  const sz = props.size ?? (primary ? 'lg' : 'sm');
  return primary
    ? cx('btn', sz === 'sm' && 'sm', props.loading && 'is-load', props.done && 'done', props.disabled && 'is-off')
    : cx('b2', iconOnly.value && 'ico', sz === 'lg' && 'lg', props.variant === 'destructive' && 'dng', props.variant === 'ghost' && 'gh', props.disabled && 'is-off');
});
</script>

<template>
  <button :type="type" :class="cls" :disabled="disabled || loading" :aria-busy="loading || undefined" :style="style"><i v-if="loading" class="spin" aria-hidden="true" /><Icon v-if="icon" :name="icon" /><span v-if="done" class="roll"><slot>{{ text }}</slot></span><template v-else><slot>{{ text }}</slot></template></button>
</template>
