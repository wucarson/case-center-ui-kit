<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { PRESETS, WEEK, addDays, fmtDay, fromISO, monthCells, todayISO } from '../../../shared/dates';
import Icon from './Icon.vue';
import { cx, type StyleProp } from './util';

/** 日期選擇：左側快捷（今天、明天、一週後、月底）、右側月曆；選了就生效。方向鍵移動、Enter 選取、Esc 關閉。v-model:value */
const props = defineProps<{
  /** 'YYYY-MM-DD' */
  value: string;
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
const emit = defineEmits<{ 'update:value': [string] }>();
const today = computed(() => props.today ?? todayISO());
const open = ref(!!props.defaultOpen);
const start = fromISO(props.value || today.value);
const view = ref<[number, number]>([start.getFullYear(), start.getMonth()]);
const cursor = ref(props.value || today.value);
const root = ref<HTMLElement>();
const grid = ref<HTMLElement>();
const sel = ref<HTMLElement>();
const cells = computed(() => monthCells(view.value[0], view.value[1]));
const off = (e: MouseEvent) => { if (!root.value?.contains(e.target as Node)) open.value = false; };
watch(open, (o) => (o ? document.addEventListener('mousedown', off) : document.removeEventListener('mousedown', off)), { immediate: true });
onBeforeUnmount(() => document.removeEventListener('mousedown', off));
// 選中的圓：量選中日期格的位置（量法同展示牆）
watch([open, () => props.value, view], async () => {
  await nextTick();
  const on = grid.value?.querySelector<HTMLElement>('span.on');
  if (!sel.value) return;
  sel.value.style.display = on ? '' : 'none';
  if (on) sel.value.style.transform = `translate(${on.offsetLeft + (on.offsetWidth - 32) / 2}px, ${on.offsetTop + (on.offsetHeight - 32) / 2}px)`;
}, { immediate: true });
const pick = (d: string) => { if (props.min && d < props.min) return; emit('update:value', d); open.value = false; };
const shift = (n: number) => { const d = new Date(view.value[0], view.value[1] + n, 1); view.value = [d.getFullYear(), d.getMonth()]; };
const onGridKey = (e: KeyboardEvent) => {
  const step = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 } as Record<string, number>)[e.key];
  if (step) { e.preventDefault(); cursor.value = addDays(cursor.value, step); const d = fromISO(cursor.value); view.value = [d.getFullYear(), d.getMonth()]; }
  if (e.key === 'Enter') { e.preventDefault(); pick(cursor.value); }
  if (e.key === 'Escape') { e.preventDefault(); open.value = false; }
};
const onFieldKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); open.value = true; } };
const dayClass = (d: string) => cx(props.min !== undefined && d < props.min && 'off', d === today.value && 'today', d === props.value && 'on') || undefined;
</script>

<template>
  <div ref="root" :class="cx('dp', open && 'open')" :style="style"><div class="dp-f" role="button" tabindex="0" :aria-label="`${label}：${fmtDay(value)}`" aria-haspopup="dialog" :aria-expanded="open" @click="open = !open" @keydown="onFieldKey"><span class="roll"><span>{{ fmtDay(value) }}</span></span><Icon name="calendar" /></div><div v-if="help" class="dp-h">{{ help }}</div><div v-if="open" class="dp-p" role="dialog" :aria-label="label"><div class="dp-pre"><span v-for="p in PRESETS(today)" :key="p.label" role="button" tabindex="0" :class="p.value === value ? 'on' : undefined" @click="pick(p.value)" @keydown.enter="pick(p.value)">{{ p.label }}</span></div><div class="dp-c"><div class="dp-m"><span>{{ view[0] }} 年 {{ view[1] + 1 }} 月</span><span><svg class="ic" viewBox="0 0 24 24" role="button" tabindex="-1" aria-label="上個月" @click="shift(-1)"><path d="M15 6l-6 6 6 6" /></svg><svg class="ic" viewBox="0 0 24 24" role="button" tabindex="-1" aria-label="下個月" @click="shift(1)"><path d="M9 6l6 6-6 6" /></svg></span></div><div ref="grid" class="dp-g" role="grid" tabindex="0" :aria-label="`${view[0]} 年 ${view[1] + 1} 月`" @keydown="onGridKey"><i ref="sel" class="dp-sel" /><b v-for="w in WEEK.split('')" :key="w">{{ w }}</b><template v-for="(d, i) in cells" :key="d ?? 'x' + i"><span v-if="d === null" aria-hidden="true" /><span v-else role="gridcell" :aria-selected="d === value" :class="dayClass(d)" @click="pick(d)">{{ fromISO(d).getDate() }}</span></template></div></div></div></div>
</template>
