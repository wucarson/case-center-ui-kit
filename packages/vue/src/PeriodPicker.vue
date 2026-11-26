<script setup lang="ts">
import { useFormBlur, useFormValue } from './form';
import { computed, nextTick, ref, watch } from 'vue';
import { focusNth } from '@wucarson/facet-core/choice';
import { periodIndex, periodKey, periodText, placePeriodPill } from '@wucarson/facet-core/date';
import { PERIODS, todayISO, type PeriodKey } from '@wucarson/facet-core/dates';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

/** 期間選擇：本月、近 30 天、近 90 天或自訂；範圍以文字寫出。選中片滑動，左右鍵切換。v-model:value。規則在 core/date.ts。 */
const props = defineProps<{
  value?: PeriodKey;
  /** 標準 v-model */
  modelValue?: PeriodKey;
  /** 停用：不能切換（展示牆尚無停用樣式） */
  disabled?: boolean;
  /** 「自訂」的起訖 'YYYY-MM-DD' */
  custom?: [string, string];
  /** 今天（測試、資料截止日用）；預設是系統今天 */
  today?: string;
  style?: StyleProp;
}>();
const emit = defineEmits<{ 'update:value': [PeriodKey]; 'update:modelValue': [PeriodKey]; blur: [] }>();
const { val, set } = useFormValue<PeriodKey>(props, 'value', emit, 'month');
const onOut = useFormBlur(emit);
const select = (k: PeriodKey) => { if (!props.disabled) set(k); };
const ps = ref<HTMLElement>();
const pill = ref<HTMLElement>();
const cur = computed(() => periodIndex(val.value));
const range = computed(() => periodText(val.value, props.today ?? todayISO(), props.custom));
watch(val, async () => { await nextTick(); placePeriodPill(ps.value, pill.value); }, { immediate: true });
const onKey = (e: KeyboardEvent) => {
  const n = periodKey(cur.value, e.key);
  if (n === null || props.disabled) return;
  e.preventDefault();
  set(PERIODS[n].key);
  if (ps.value) focusNth(ps.value, '[role="radio"]', n);
};
</script>

<template>
  <div :style="style" @focusout="onOut"><div ref="ps" class="ps" :class="{ dis: disabled }" role="radiogroup" aria-label="期間" :aria-disabled="disabled || undefined" @keydown="onKey"><i ref="pill" /><span v-for="(p, i) in PERIODS" :key="p.key" role="radio" :aria-checked="i === cur" :tabindex="i === cur && !disabled ? 0 : -1" :class="i === cur ? 'on' : undefined" @click="select(p.key)">{{ p.label }}<Icon v-if="p.key === 'custom'" name="chevronDown" /></span></div><div class="ps-r">{{ range }}</div></div>
</template>
