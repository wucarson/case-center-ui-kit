<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { countUp } from '../../../core/metrics';

/** 數字（.num）：animate 時換值會從舊值滾到新值（統計卡、分段統計條共用） */
const props = defineProps<{ value: number | string; animate?: boolean }>();
const el = ref<HTMLElement>();
let stop = () => {};
watch(() => props.value, (v, from) => {
  stop();
  if (props.animate && el.value && typeof v === 'number' && typeof from === 'number') stop = countUp(el.value, from, v);
});
onBeforeUnmount(() => stop());
</script>

<template>
  <b ref="el" class="num">{{ value }}</b>
</template>
