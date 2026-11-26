<script setup lang="ts">
import { useFormBlur, useFormValue } from './form';
import { computed } from 'vue';
import { TIME_COLS, pad2, parseTime, timeKey, timeStep, type TimePart } from '@wucarson/facet-core/time';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

/** 時間選擇：時、分各自上下調（各自循環，不互相進位）。數值格可聚焦，↑↓ 調整。v-model:value（'HH:mm'）。規則在 core/time.ts。 */
const props = withDefaults(defineProps<{
  value?: string;
  /** 標準 v-model */
  modelValue?: string;
  /** 停用：不能調整（展示牆尚無停用樣式） */
  disabled?: boolean;
  /** 讀屏名稱，例：「開始時間」 */
  label: string;
  /** 分鐘每次調整幾分（預設 5） */
  step?: number;
  style?: StyleProp;
}>(), { step: 5 });
const emit = defineEmits<{ 'update:value': [string]; 'update:modelValue': [string]; blur: [] }>();
const { val, set } = useFormValue(props, 'value', emit, '00:00');
const onOut = useFormBlur(emit);
const hm = computed(() => parseTime(val.value));
const inc = (part: TimePart, d: 1 | -1) => { if (!props.disabled) set(timeStep(val.value, part, d, props.step)); };
const onKey = (e: KeyboardEvent, part: TimePart) => { const d = timeKey(e.key); if (d) { e.preventDefault(); inc(part, d); } };
</script>

<template>
  <div class="tp" :style="style" role="group" :aria-label="label" :aria-disabled="disabled || undefined" @focusout="onOut"><div class="tp-f" aria-hidden="true"><span class="roll"><span>{{ val }}</span></span><Icon name="clock" /></div><div class="tp-c"><template v-for="(c, i) in TIME_COLS" :key="c.part"><b v-if="i === 1">:</b><div class="tp-col"><u role="button" tabindex="-1" :aria-label="`${c.name}加一`" @click="inc(c.part, 1)"><Icon name="chevronUp" /></u><span class="v" role="spinbutton" :tabindex="disabled ? -1 : 0" :aria-label="c.name" :aria-valuenow="hm[i]" aria-valuemin="0" :aria-valuemax="c.max" @keydown="onKey($event, c.part)"><span class="roll"><span>{{ pad2(hm[i]) }}</span></span></span><u role="button" tabindex="-1" :aria-label="`${c.name}減一`" @click="inc(c.part, -1)"><Icon name="chevronDown" /></u></div></template></div></div>
</template>
