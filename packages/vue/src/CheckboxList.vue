<script setup lang="ts">
import Checkbox from './Checkbox.vue';
import type { StyleProp } from './util';

/** 一組核取方塊（垂直排列）。第一項可設 selectAll。 */
defineProps<{
  items: { label?: string; checked?: boolean; indeterminate?: boolean; selectAll?: boolean; disabled?: boolean; key?: string }[];
  style?: StyleProp;
}>();
const emit = defineEmits<{ change: [index: number, checked: boolean] }>();
</script>

<template>
  <div class="cks" role="group" :style="style"><Checkbox v-for="(it, i) in items" :key="it.key ?? i" v-bind="it" @update:checked="(v: boolean) => emit('change', i, v)" /></div>
</template>
