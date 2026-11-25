<script setup lang="ts">
import { computed } from 'vue';
import { dueTag, dueText, tagClass, todayIso } from '@wucarson/facet-core/table';

/** 到期欄：逾期紅、今天與 3 天內琥珀；已結案只顯示日期。規則在 core/table.ts。 */
const props = defineProps<{
  /** 到期日：YYYY-MM-DD 或 MM-DD */
  due: string;
  /** 今天（預設系統日期）；比對與測試時固定 */
  today?: string;
  /** 已結案：只顯示日期 */
  closed?: boolean;
  /** 在表格列裡（class due、role cell）；預設單獨使用（class due-r） */
  inRow?: boolean;
}>();
const tag = computed(() => dueTag(props.due, props.today ?? todayIso(), props.closed));
</script>

<template>
  <span :class="inRow ? 'due' : 'due-r'" :role="inRow ? 'cell' : undefined">{{ dueText(due) }}<span v-if="tag" :class="tagClass(tag)">{{ tag.label }}</span></span>
</template>
