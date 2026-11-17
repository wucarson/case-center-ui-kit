<script setup lang="ts">
import { ICONS, type IconName } from '../../../shared/icons';
/** <Icon name="trash" />：輸出和展示牆相同的 <svg class="ic"> */
defineProps<{ name: IconName; class?: string }>();
</script>

<template>
  <svg :class="['ic', $props.class]" viewBox="0 0 24 24" aria-hidden="true" v-html="ICONS[name]" />
</template>
