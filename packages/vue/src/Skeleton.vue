<script setup lang="ts">
import { cx, type StyleProp } from './util';

/** 骨架載入（人員列）：骨架形狀照實際內容，載入後不跳動。loading=false 時骨架淡出、內容淡入。 */
defineProps<{
  loading: boolean;
  /** 頭像：字與分類色 1–4 */
  avatar: { initial: string; color: 1 | 2 | 3 | 4 };
  title: string;
  subtitle?: string;
  style?: StyleProp;
}>();
</script>

<template>
  <div :class="cx('sk', !loading && 'loaded')" :style="style" :aria-busy="loading"><div class="ghost" aria-hidden="true"><span class="av shim" /><span class="ls"><b class="shim" /><b class="shim" /></span></div><div class="real" :aria-hidden="loading"><span class="av" :style="{ background: `var(--cat${avatar.color})` }">{{ avatar.initial }}</span><div><p>{{ title }}</p><small>{{ subtitle }}</small></div></div></div>
</template>
