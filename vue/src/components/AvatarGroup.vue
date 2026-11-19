<script setup lang="ts">
import { computed, ref } from 'vue';
import { avatarNames, avatarRest, avatarShown, avatarStackClass, avatarStyle, avatarTotal, type AvatarPerson } from '../../../core/display';
import type { StyleProp } from './util';

/** 成員頭像群組：重疊排列，滑過時展開；超過 max 收成 +N，右邊寫總人數。規則在 core/display.ts。 */
const props = withDefaults(defineProps<{
  /** initial：頭像上的字（通常是姓）；color：分類色 1–4 */
  people: AvatarPerson[];
  /** 最多顯示幾位（預設 3） */
  max?: number;
  style?: StyleProp;
}>(), { max: 3 });
const spread = ref(false);
const rest = computed(() => avatarRest(props.people, props.max));
</script>

<template>
  <div class="ppl-r" :style="style"><div :class="avatarStackClass(spread)" role="list" :aria-label="avatarNames(people)" @mouseenter="spread = true" @mouseleave="spread = false"><span v-for="p in avatarShown(people, max)" :key="p.name" class="av" :style="avatarStyle(p)" role="listitem" :title="p.name">{{ p.initial }}</span><span v-if="rest > 0" class="av more" role="listitem" :title="avatarNames(people.slice(max))">+{{ rest }}</span></div><span class="ppl-c">{{ avatarTotal(people) }}</span></div>
</template>
