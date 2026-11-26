<script setup lang="ts">
import { useFormBlur, useFormValue } from './form';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { MONTH_NEXT, MONTH_PREV, canPickDay, dateFieldLabel, dateGridKey, dayClass, isDateOpenKey, monthTitle, placeDaySel, shiftView, viewOf, type MonthView } from '@wucarson/facet-core/date';
import { cx, onOutsidePointer } from '@wucarson/facet-core/dom';
import { PRESETS, WEEK, fmtDay, fromISO, monthCells, todayISO } from '@wucarson/facet-core/dates';
import Icon from './Icon.vue';
import type { StyleProp } from './util';

/** 日期選擇：左側快捷（今天、明天、一週後、月底）、右側月曆；選了就生效。方向鍵移動、Enter 選取、Esc 關閉。v-model:value。規則在 core/date.ts。 */
const props = defineProps<{
  /** 'YYYY-MM-DD'；空字串＝未選 */
  value?: string;
  /** 標準 v-model */
  modelValue?: string;
  /** 停用：不能展開（展示牆尚無停用樣式） */
  disabled?: boolean;
  /** 讀屏名稱，例：「結束日期」 */
  label: string;
  help?: string;
  /** 最早可選（之前的日期變淡、不能選） */
  min?: string;
  /** 今天（測試、資料截止日用）；預設是系統今天 */
  today?: string;
  defaultOpen?: boolean;
  style?: StyleProp;
}>();
const emit = defineEmits<{ 'update:value': [string]; 'update:modelValue': [string]; blur: [] }>();
const { val, set } = useFormValue(props, 'value', emit, '');
const onOut = useFormBlur(emit);
const today = computed(() => props.today ?? todayISO());
const open = ref(!!props.defaultOpen);
const view = ref<MonthView>(viewOf(val.value || today.value));
const cursor = ref(val.value || today.value);
watch(val, (v) => { view.value = viewOf(v || today.value); cursor.value = v || today.value; });
const root = ref<HTMLElement>();
const grid = ref<HTMLElement>();
const sel = ref<HTMLElement>();
const cells = computed(() => monthCells(view.value[0], view.value[1]));
let off: (() => void) | undefined;
watch(open, (o) => { off?.(); off = o && root.value ? onOutsidePointer(root.value, () => { open.value = false; }) : undefined; }, { flush: 'post', immediate: true });
onBeforeUnmount(() => off?.());
watch([open, val, view], async () => { await nextTick(); placeDaySel(grid.value, sel.value); }, { immediate: true });
const pick = (d: string) => { if (!canPickDay(d, props.min)) return; set(d); open.value = false; };
const shift = (n: number) => { view.value = shiftView(view.value, n); };
const onGridKey = (e: KeyboardEvent) => {
  const r = dateGridKey(cursor.value, e.key);
  if (!r) return;
  e.preventDefault();
  if (r.type === 'move') { cursor.value = r.cursor; view.value = r.view; }
  else if (r.type === 'pick') pick(cursor.value);
  else open.value = false;
};
const onFieldKey = (e: KeyboardEvent) => { if (!props.disabled && isDateOpenKey(e.key)) { e.preventDefault(); open.value = true; } };
</script>

<template>
  <div ref="root" :class="cx('dp', open && 'open', disabled && 'dis')" :style="style" @focusout="onOut"><div class="dp-f" role="button" :tabindex="disabled ? -1 : 0" :aria-disabled="disabled || undefined" :aria-label="dateFieldLabel(label, val)" aria-haspopup="dialog" :aria-expanded="open" @click="!disabled && (open = !open)" @keydown="onFieldKey"><span class="roll"><span>{{ val ? fmtDay(val) : '' }}</span></span><Icon name="calendar" /></div><div v-if="help" class="dp-h">{{ help }}</div><div v-if="open" class="dp-p" role="dialog" :aria-label="label"><div class="dp-pre"><span v-for="p in PRESETS(today)" :key="p.label" role="button" tabindex="0" :class="p.value === val ? 'on' : undefined" @click="pick(p.value)" @keydown.enter="pick(p.value)">{{ p.label }}</span></div><div class="dp-c"><div class="dp-m"><span>{{ monthTitle(view) }}</span><span><svg class="ic" viewBox="0 0 24 24" role="button" tabindex="-1" aria-label="上個月" @click="shift(-1)" v-html="MONTH_PREV" /><svg class="ic" viewBox="0 0 24 24" role="button" tabindex="-1" aria-label="下個月" @click="shift(1)" v-html="MONTH_NEXT" /></span></div><div ref="grid" class="dp-g" role="grid" tabindex="0" :aria-label="monthTitle(view)" @keydown="onGridKey"><i ref="sel" class="dp-sel" /><b v-for="w in WEEK.split('')" :key="w">{{ w }}</b><template v-for="(d, i) in cells" :key="d ?? 'x' + i"><span v-if="d === null" aria-hidden="true" /><span v-else role="gridcell" :aria-selected="d === val" :class="dayClass(d, val, today, min)" @click="pick(d)">{{ fromISO(d).getDate() }}</span></template></div></div></div></div>
</template>
