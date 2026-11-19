<script setup lang="ts">
import { computed } from 'vue';
import { fileTone, uploadBarLabel, uploadClass, uploadText, uploadWidth, type UploadStatus } from '../../../core/upload';
import type { StyleProp } from './util';

/** 檔案上傳：一個附件的進度、完成或失敗；圖示顏色依檔案類型。規則在 core/upload.ts。 */
const props = withDefaults(defineProps<{
  /** 檔名（含副檔名，圖示顏色依副檔名） */
  name: string;
  status: UploadStatus;
  /** 上傳進度 0–100 */
  progress?: number;
  /** 檔案大小（MB）：給了就寫「1.1 / 2.4 MB・45%」 */
  size?: number;
  style?: StyleProp;
}>(), { progress: 0 });
const pct = computed(() => uploadWidth(props.status, props.progress));
const FILE = '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>';
</script>

<template>
  <div :class="uploadClass(status)" :style="style"><span class="up-i" :style="{ '--tone': fileTone(name) }"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true" v-html="FILE" /></span><div class="up-m"><div class="up-r"><span class="roll nm"><span>{{ name }}</span></span><span class="st num" aria-live="polite">{{ uploadText(status, progress, size) }}</span></div><div class="up-b" role="progressbar" :aria-label="uploadBarLabel(name)" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="parseFloat(pct)"><i :style="{ width: pct }" /></div></div></div>
</template>
