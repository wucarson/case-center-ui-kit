<script setup lang="ts">
import { ICONS, ICONS_FILL, type FillIconName, type IconName } from '../../../shared/icons';
/** <Icon name="trash" />：輸出和展示牆相同的 <svg class="ic">；fill＝填滿版（<svg class="ic fl">，選中時顯示） */
defineProps<{ name: IconName; fill?: boolean; class?: string }>();
</script>

<template>
  <svg :class="['ic', fill && 'fl', $props.class]" viewBox="0 0 24 24" aria-hidden="true" v-html="fill ? ICONS_FILL[name as FillIconName] : ICONS[name]" />
</template>
