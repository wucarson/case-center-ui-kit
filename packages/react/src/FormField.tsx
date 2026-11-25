import { useId, useState, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';
import { SR_ONLY_STYLE, fieldClass, fieldCount, fieldInputClass, fieldMark, leftField } from '@wucarson/facet-core/field';
import type { IconName } from '@wucarson/facet-core/icons';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export interface FormFieldProps {
  label: string;
  /** 必填：標籤後加紅色星號 */
  required?: boolean;
  /** 選填：標籤後加「（選填）」 */
  optional?: boolean;
  /** 唯讀（系統帶入）：不標必填也不標選填 */
  readOnly?: boolean;
  disabled?: boolean;
  /** 必填且尚未填寫：標籤旁顯示「尚未填寫」 */
  empty?: boolean;
  emptyLabel?: string;
  help?: ReactNode;
  /** 字數，例：'4 / 50' */
  counter?: string;
  /** 錯誤訊息：位置先留好，出現時欄位不跳動 */
  error?: string;
  /** 多行（輸入框較高、文字靠上） */
  multiline?: boolean;
  /** 給 label 對應的輸入框 id */
  htmlFor?: string;
  className?: string;
  style?: string | CSSProperties;
  /** 輸入框區（.ff-i）裡的內容 */
  children: ReactNode;
}

/** 表單欄位外框：標籤＋輸入框＋說明／錯誤。輸入框聚焦時整框換主色並加光圈。規則在 core/field.ts。 */
export function FormField({ label, required, optional, readOnly, disabled, empty, emptyLabel = '尚未填寫', help, counter, error, multiline, htmlFor, className, style, children }: FormFieldProps) {
  const [focus, setFocus] = useState(false);
  const mark = fieldMark({ readOnly, required, optional });
  return (
    <div
      className={cx(fieldClass({ readOnly, disabled, error, focus }), className)}
      style={styleOf(style)}
      onFocus={() => setFocus(true)}
      onBlur={(e) => { if (leftField(e.currentTarget, e.relatedTarget)) setFocus(false); }}
    >
      <label className="ff-l" htmlFor={htmlFor}>
        {label}
        {mark === 'req' ? <span className="req" aria-hidden="true">*</span> : mark === 'opt' ? <span className="opt">（選填）</span> : null}
        {required && <span className="sr-only" style={SR_ONLY_STYLE as CSSProperties}>必填</span>}
        {empty && <span className="ff-e">{emptyLabel}</span>}
      </label>
      <div className={fieldInputClass(multiline)}>{children}</div>
      {!error && <div className="ff-h"><span>{help}</span>{counter && <span className="cnt" aria-live="polite">{counter}</span>}</div>}
      <div className="ff-x" role={error ? 'alert' : undefined}>{error}</div>
    </div>
  );
}

export interface TextFieldProps extends Omit<FormFieldProps, 'children' | 'htmlFor'>, Omit<InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement>, 'style' | 'className' | 'children'> {
  /** 前面的圖示（只給有固定意義的，例如搜尋） */
  prefix?: IconName;
  /** 單位，放框內右側 */
  suffix?: string;
  /** 有 maxLength 時自動顯示字數 */
  showCount?: boolean;
}

/**
 * 文字欄位＝FormField＋輸入框。
 *   <TextField label="工單名稱" required maxLength={50} showCount value={v} onChange={…} />
 */
export function TextField({ label, required, optional, readOnly, disabled, empty, emptyLabel, help, counter, error, multiline, prefix, suffix, showCount, className, style, id, ...input }: TextFieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  const count = fieldCount(String(input.value ?? input.defaultValue ?? ''), input.maxLength, showCount, counter);
  const common = { id: fid, readOnly, disabled, 'aria-invalid': error ? true : undefined, 'aria-required': required || undefined, ...input };
  return (
    <FormField {...{ label, required, optional, readOnly, disabled, empty, emptyLabel, help, error, multiline, className, style }} counter={count} htmlFor={fid}>
      {prefix && <Icon name={prefix} />}
      {multiline ? <textarea {...common} /> : <input {...common} />}
      {suffix && <span className="unit">{suffix}</span>}
      {readOnly && <Icon name="lock" />}
    </FormField>
  );
}
