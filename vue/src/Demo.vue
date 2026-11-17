<script setup lang="ts">
import type { Component } from 'vue';
import { CASES } from '../../shared/cases';
import { Button, Checkbox, CheckboxList, RadioGroup, Segmented, Switch } from './components';

/** 展示頁：把 shared/cases.ts 的每個案例用元件畫出來，給 tools/compare.mjs 截圖比對 */
const RENDER: Record<string, (p: Record<string, unknown>) => Component> = {
  button: () => Button,
  switch: () => Switch,
  checkbox: (p) => (p.list ? CheckboxList : Checkbox),
  'radio-group': () => RadioGroup,
  segmented: () => Segmented,
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
