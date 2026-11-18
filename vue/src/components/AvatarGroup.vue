<script setup lang="ts">
import { computed, ref } from 'vue';
import { cx, type StyleProp } from './util';

/** 成員頭像群組：重疊排列，滑過時展開；超過 max 收成 +N，右邊寫總人數。 */
const props = withDefaults(defineProps<{
  /** initial：頭像上的字（通常是姓）；color：分類色 1–4 */
  people: { name: string; initial: string; color: 1 | 2 | 3 | 4 }[];
  /** 最多顯示幾位（預設 3） */
  max?: number;
  style?: StyleProp;
}>(), { max: 3 });
const spread = ref(false);
const shown = computed(() => props.people.slice(0, props.max));
const rest = computed(() => props.people.length - shown.value.length);
</script>

<template>
  <div class="ppl-r" :style="style"><div :class="cx('stack', spread && 'spread')" role="list" :aria-label="people.map((p) => p.name).join('、')" @mouseenter="spread = true" @mouseleave="spread = false"><span v-for="p in shown" :key="p.name" class="av" :style="{ '--a': `var(--cat${p.color})` }" role="listitem" :title="p.name">{{ p.initial }}</span><span v-if="rest > 0" class="av more" role="listitem" :title="people.slice(max).map((p) => p.name).join('、')">+{{ rest }}</span></div><span class="ppl-c">共 {{ people.length }} 位</span></div>
</template>
