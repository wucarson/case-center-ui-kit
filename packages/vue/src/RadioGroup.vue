<script setup lang="ts">
import { ref } from 'vue';
import { focusNth, radioClass, radioKey, radioMove, radioTabIndex, type RadioOption } from '@wucarson/facet-core/choice';
import type { StyleProp } from './util';

export type { RadioOption };

/** 單選清單：2–5 個互斥選項、選項都看得到。方向鍵切換。v-model:value。規則在 core/choice.ts。 */
const props = defineProps<{
  options: RadioOption[];
  value?: string;
  /** 只有一個選項、不包外層清單（展示單一狀態用） */
  single?: boolean;
  style?: StyleProp;
}>();
const emit = defineEmits<{ 'update:value': [string] }>();
const root = ref<HTMLElement>();
const focusAt = ref(-1);
const pick = (o: RadioOption) => { if (!o.disabled) emit('update:value', o.value); };
const onKey = (e: KeyboardEvent, i: number) => {
  const r = radioKey(e.key);
  if (!r) return;
  e.preventDefault();
  if (r.type === 'pick') { pick(props.options[i]); return; }
  const j = radioMove(props.options, i, r.dir);
  if (j < 0) return;
  emit('update:value', props.options[j].value);
  if (root.value) focusNth(root.value, '[role="radio"]', j);
};
const onFocus = (e: FocusEvent, i: number) => { focusAt.value = (e.currentTarget as HTMLElement).matches(':focus-visible') ? i : -1; };
</script>

<template>
  <div ref="root" role="radiogroup" :class="single ? undefined : 'rads'" :style="single ? { display: 'contents' } : style"><div v-for="(o, i) in options" :key="o.value" role="radio" :aria-checked="o.value === value" :aria-disabled="o.disabled || undefined" :tabindex="radioTabIndex(options, value, i)" :class="radioClass(o, o.value === value)" @click="pick(o)" @keydown="onKey($event, i)" @focus="onFocus($event, i)" @blur="focusAt = -1"><i :class="focusAt === i ? 'is-focus' : undefined" /><span v-if="o.description"><b>{{ o.label }}</b><small>{{ o.description }}</small></span><template v-else>{{ o.label }}</template></div></div>
</template>
