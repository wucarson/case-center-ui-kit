<script setup lang="ts">
import { computed, useId } from 'vue';
import type { IconName } from '../../../shared/icons';
import FormField from './FormField.vue';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

/**
 * 文字欄位＝FormField＋輸入框。v-model:value
 *   <TextField label="工單名稱" required :maxLength="50" showCount v-model:value="name" />
 */
const props = defineProps<{
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  empty?: boolean;
  emptyLabel?: string;
  help?: string;
  counter?: string;
  error?: string;
  multiline?: boolean;
  maxLength?: number;
  /** 有 maxLength 時自動顯示字數 */
  showCount?: boolean;
  /** 前面的圖示（只給有固定意義的，例如搜尋） */
  prefix?: IconName;
  /** 單位，放框內右側 */
  suffix?: string;
  id?: string;
  style?: StyleProp;
}>();
const emit = defineEmits<{ 'update:value': [string] }>();
const auto = useId();
const fid = computed(() => props.id ?? auto);
const count = computed(() => props.counter ?? (props.showCount && props.maxLength ? `${(props.value ?? '').length} / ${props.maxLength}` : undefined));
const onInput = (e: Event) => emit('update:value', (e.target as HTMLInputElement).value);
</script>

<template>
  <FormField v-bind="{ label, required, optional, readOnly, disabled, empty, emptyLabel, help, error, multiline, style }" :counter="count" :html-for="fid"><Icon v-if="prefix" :name="prefix" /><textarea v-if="multiline" :id="fid" :value="value" :placeholder="placeholder" :readonly="readOnly" :disabled="disabled" :maxlength="maxLength" :aria-invalid="error ? true : undefined" :aria-required="required || undefined" @input="onInput" /><input v-else :id="fid" :value="value" :placeholder="placeholder" :readonly="readOnly" :disabled="disabled" :maxlength="maxLength" :aria-invalid="error ? true : undefined" :aria-required="required || undefined" @input="onInput" /><span v-if="suffix" class="unit">{{ suffix }}</span><Icon v-if="readOnly" name="lock" /></FormField>
</template>
