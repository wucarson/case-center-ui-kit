<script setup lang="ts">
import Icon from './Icon.vue';
import { cx } from './util';

/** 單則提示（.toast） */
const props = withDefaults(defineProps<{
  /** 主訊息，寫結果：「已儲存」 */
  title: string;
  /** 補述，例：「等待 陳大文 覆核」 */
  detail?: string;
  tone?: 'ok' | 'info' | 'warn';
  /** 給了就顯示動作（例：「復原」） */
  action?: { label: string; onClick?: () => void };
}>(), { tone: 'ok' });
const emit = defineEmits<{ action: [] }>();
const run = () => { props.action?.onClick?.(); emit('action'); };
</script>

<template>
  <div :class="cx('toast', tone)" role="status"><Icon :name="tone" /><div><b>{{ title }}</b><small v-if="detail">{{ detail }}</small></div><em v-if="action" role="button" tabindex="0" @click="run" @keydown.enter="run">{{ action.label }}</em></div>
</template>
