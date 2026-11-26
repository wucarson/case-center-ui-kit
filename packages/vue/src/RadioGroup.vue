<script setup lang="ts">
import { useFormBlur, useFormValue } from './form';
import { computed, ref } from 'vue';
import { focusNth, radioClass, radioKey, radioMove, radioTabIndex, type RadioOption } from '@wucarson/facet-core/choice';
import type { StyleProp } from './util';

export type { RadioOption };

/** 單選清單：2–5 個互斥選項、選項都看得到。方向鍵切換。v-model:value。規則在 core/choice.ts。 */
const props = defineProps<{
  options: RadioOption[];
  value?: string;
  /** 標準 v-model */
  modelValue?: string;
  /** 整組停用（表單停用） */
  disabled?: boolean;
  /** 只有一個選項、不包外層清單（展示單一狀態用） */
  single?: boolean;
  style?: StyleProp;
}>();
const emit = defineEmits<{ 'update:value': [string]; 'update:modelValue': [string]; blur: [] }>();
const { val, set } = useFormValue<string | undefined>(props, 'value', emit, undefined);
const onOut = useFormBlur(emit);
const opts = computed(() => (props.disabled ? props.options.map((o) => ({ ...o, disabled: true })) : props.options));
const root = ref<HTMLElement>();
const focusAt = ref(-1);
const pick = (o: RadioOption) => { if (!o.disabled) set(o.value); };
const onKey = (e: KeyboardEvent, i: number) => {
  const r = radioKey(e.key);
  if (!r) return;
  e.preventDefault();
  if (r.type === 'pick') { pick(opts.value[i]); return; }
  const j = radioMove(opts.value, i, r.dir);
  if (j < 0) return;
  set(opts.value[j].value);
  if (root.value) focusNth(root.value, '[role="radio"]', j);
};
const onFocus = (e: FocusEvent, i: number) => { focusAt.value = (e.currentTarget as HTMLElement).matches(':focus-visible') ? i : -1; };
</script>

<template>
  <div ref="root" role="radiogroup" :class="single ? undefined : 'rads'" :style="single ? { display: 'contents' } : style" @focusout="onOut"><div v-for="(o, i) in opts" :key="o.value" role="radio" :aria-checked="o.value === val" :aria-disabled="o.disabled || undefined" :tabindex="radioTabIndex(opts, val, i)" :class="radioClass(o, o.value === val)" @click="pick(o)" @keydown="onKey($event, i)" @focus="onFocus($event, i)" @blur="focusAt = -1"><i :class="focusAt === i ? 'is-focus' : undefined" /><span v-if="o.description"><b>{{ o.label }}</b><small>{{ o.description }}</small></span><template v-else>{{ o.label }}</template></div></div>
</template>
