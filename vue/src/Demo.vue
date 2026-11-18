<script setup lang="ts">
import { h, type Component } from 'vue';
import { CASES } from '../../shared/cases';
import { Button, Checkbox, CheckboxList, Combo, ConfirmDialog, FormField, Menu, MenuPanel, MultiSelect, RadioGroup, Segmented, Switch, TextField, Toast } from './components';

// 放在 FormField 裡的下拉／多選：field 是外框的設定
const inField = (C: Component) => (p: Record<string, any>) => { const { field, ...rest } = p; return h(FormField, field, () => h(C, { ...rest, inField: true })); };

/** 展示頁：把 shared/cases.ts 的每個案例用元件畫出來，給 tools/compare.mjs 截圖比對 */
const RENDER: Record<string, (p: Record<string, unknown>) => Component> = {
  button: () => Button,
  switch: () => Switch,
  checkbox: (p) => (p.list ? CheckboxList : Checkbox),
  'radio-group': () => RadioGroup,
  segmented: () => Segmented,
  'form-field': () => TextField,
  combo: (p) => (p.field ? (inField(Combo) as unknown as Component) : Combo),
  'multi-select': (p) => (p.field ? (inField(MultiSelect) as unknown as Component) : MultiSelect),
  menu: (p) => (p.inline ? MenuPanel : Menu),
  dialog: () => ConfirmDialog,
  toast: () => Toast,
};
const only = new URLSearchParams(location.search).get('c');
const list = Object.entries(CASES).filter(([n]) => (!only || n === only) && RENDER[n]).flatMap(([n, cs]) => cs.map((c) => ({ n, c })));
</script>

<template>
  <main class="cases">
    <div v-for="{ n, c } in list" :key="n + c.id" class="case" :data-c="n" :data-id="c.id" :data-interact="c.interact ? JSON.stringify(c.interact) : undefined">
      <component :is="c.wrapTag === 'span' ? 'span' : 'div'" v-if="c.wrap" :style="c.wrap">
        <template v-if="c.group"><component :is="RENDER[n](p)" v-for="(p, i) in c.group" :key="i" v-bind="p" /></template>
        <component :is="RENDER[n](c.props ?? {})" v-else v-bind="c.props" />
      </component>
      <template v-else-if="c.group"><component :is="RENDER[n](p)" v-for="(p, i) in c.group" :key="i" v-bind="p" /></template>
      <component :is="RENDER[n](c.props ?? {})" v-else v-bind="c.props" />
    </div>
  </main>
</template>
