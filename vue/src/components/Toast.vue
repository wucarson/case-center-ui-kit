<script setup lang="ts">
import { TOAST_ICON, isToastActionKey, toastClass, type ToastTone } from '../../../core/toast';
import Icon from './Icon.vue';

/** 單則提示（.toast）。規則在 core/toast.ts。 */
const props = withDefaults(defineProps<{
  /** 主訊息，寫結果：「已儲存」 */
  title: string;
  /** 補述，例：「等待 陳大文 覆核」 */
  detail?: string;
  tone?: ToastTone;
  /** 給了就顯示動作（例：「復原」） */
  action?: { label: string; onClick?: () => void };
}>(), { tone: 'ok' });
const emit = defineEmits<{ action: [] }>();
const run = () => { props.action?.onClick?.(); emit('action'); };
const onKey = (e: KeyboardEvent) => { if (isToastActionKey(e.key)) run(); };
</script>

<template>
  <div :class="toastClass(tone)" role="status"><Icon :name="TOAST_ICON[tone]" /><div><b>{{ title }}</b><small v-if="detail">{{ detail }}</small></div><em v-if="action" role="button" tabindex="0" @click="run" @keydown="onKey">{{ action.label }}</em></div>
</template>
