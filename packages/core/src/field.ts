/**
 * 表單欄位外框（contracts/form-field.json）：標籤＋輸入框＋說明／錯誤。輸入框聚焦時整框換主色並加光圈。
 */
import { cx } from './dom';

/** error：錯誤訊息，或 true＝只顯示錯誤樣式（表單驗證不通過、訊息另給） */
export interface FieldState { readOnly?: boolean; disabled?: boolean; error?: string | boolean; focus?: boolean }
/** 唯讀、停用、有錯誤時不畫聚焦框 */
export const fieldClass = (s: FieldState) => cx('ff', s.readOnly && 'ro', !!s.error && 'bad', s.disabled && 'dis', s.focus && !s.readOnly && !s.disabled && !s.error && 'focus');
export const fieldInputClass = (multiline?: boolean) => cx('ff-i', multiline && 'ta');
/** 標籤後的標記：唯讀不標；必填＝紅星號；選填＝「（選填）」 */
export const fieldMark = (s: { readOnly?: boolean; required?: boolean; optional?: boolean }): 'req' | 'opt' | null =>
  s.readOnly ? null : s.required ? 'req' : s.optional ? 'opt' : null;
/** 字數：自給 counter 優先；有 maxLength 且 showCount 時自動算 */
export const fieldCount = (value: string | undefined, maxLength?: number, showCount?: boolean, counter?: string) =>
  counter ?? (showCount && maxLength ? `${(value ?? '').length} / ${maxLength}` : undefined);
/** 讀屏才念的「必填」 */
export const SR_ONLY_STYLE = { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' } as const;
/** focusout 時：焦點移到欄位外才算離開 */
export const leftField = (root: Element, related: EventTarget | null) => !root.contains(related as Node);
