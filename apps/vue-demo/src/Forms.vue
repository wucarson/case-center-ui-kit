<script setup lang="ts">
// 表單整合測試頁（?forms）：每個元件用標準 v-model 接上同一份資料；停用用 disabled、碰過用 @blur。
// tools/form-check.mjs 照 apps/shared/forms.ts 驗收。
import { reactive } from 'vue';
import { Checkbox, Combo, DatePicker, MultiSelect, PeriodPicker, RadioGroup, Segmented, Switch, TagSearch, TextField, TimePicker } from '@wucarson/facet-vue';
import { FORM_CASES, FORM_TODAY } from '../../shared/forms';

const P = Object.fromEntries(FORM_CASES.map((c) => [c.name, c.props as Record<string, any>]));
const initial = () => Object.fromEntries(FORM_CASES.map((c) => [c.field, structuredClone(c.initial)])) as Record<string, any>;
const data = reactive(initial());
const disabled = reactive<Record<string, boolean>>({});
const touched = reactive<Record<string, boolean>>({});
const blur = (f: string) => { touched[f] = true; };

(window as any).__forms = {
  value: () => JSON.parse(JSON.stringify(data)),
  set: (name: string, v: unknown) => { data[name] = v; },
  disable: (name: string) => { disabled[name] = true; },
  enable: (name: string) => { disabled[name] = false; },
  touched: (name: string) => !!touched[name],
  reset: () => { Object.assign(data, initial()); },
  submit: () => JSON.parse(JSON.stringify(data)),
};
</script>

<template>
  <form class="forms" @submit.prevent>
    <div class="fcase" data-c="form-field"><TextField v-model="data.title" :label="P['form-field'].label" :disabled="disabled.title" @blur="blur('title')" /></div>
    <div class="fcase" data-c="combo"><Combo v-model="data.kind" :items="P.combo.items" :label="P.combo.label" self-labelled :disabled="disabled.kind" @blur="blur('kind')" /></div>
    <div class="fcase" data-c="multi-select"><MultiSelect v-model="data.depts" :options="P['multi-select'].options" :noun="P['multi-select'].noun" inline-menu :disabled="disabled.depts" @blur="blur('depts')" /></div>
    <div class="fcase" data-c="date-picker"><DatePicker v-model="data.due" :label="P['date-picker'].label" :today="FORM_TODAY" :disabled="disabled.due" @blur="blur('due')" /></div>
    <div class="fcase" data-c="period-picker"><PeriodPicker v-model="data.period" :today="FORM_TODAY" :disabled="disabled.period" @blur="blur('period')" /></div>
    <div class="fcase" data-c="time-picker"><TimePicker v-model="data.start" :label="P['time-picker'].label" :disabled="disabled.start" @blur="blur('start')" /></div>
    <div class="fcase" data-c="checkbox"><Checkbox v-model="data.notify" :label="P.checkbox.label" :disabled="disabled.notify" @blur="blur('notify')" /></div>
    <div class="fcase" data-c="radio-group"><RadioGroup v-model="data.groupBy" :options="P['radio-group'].options" aria-label="分組方式" :disabled="disabled.groupBy" @blur="blur('groupBy')" /></div>
    <div class="fcase" data-c="switch"><Switch v-model="data.remind" :label="P.switch.label" :disabled="disabled.remind" @blur="blur('remind')" /></div>
    <div class="fcase" data-c="segmented"><Segmented v-model="data.range" :options="P.segmented.options" aria-label="時間範圍" :disabled="disabled.range" @blur="blur('range')" /></div>
    <div class="fcase" data-c="tag-search"><TagSearch v-model="data.q" :tags="P['tag-search'].tags" :label="P['tag-search'].label" :disabled="disabled.q" @blur="blur('q')" /></div>
  </form>
</template>
