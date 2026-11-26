import { useCallback, useImperativeHandle, useState, type FocusEvent, type ForwardedRef, type RefObject } from 'react';

/**
 * 表單值：受控（value／checked＋onChange）或非受控（defaultValue／defaultChecked）。
 * 有給 value 就是受控；沒給就元件自己記，初始值用 default。
 */
export function useControlled<T>(value: T | undefined, defaultValue: T | undefined, onChange: ((v: T) => void) | undefined, fallback: T): [T, (v: T) => void] {
  const [inner, setInner] = useState<T>(defaultValue ?? fallback);
  const controlled = value !== undefined;
  const set = useCallback((v: T) => { if (!controlled) setInner(v); onChange?.(v); }, [controlled, onChange]);
  return [controlled ? value : inner, set];
}

/** 焦點離開整個元件（不是移到元件裡的另一個元素）才呼叫 onBlur：給表單函式庫標記 touched */
export const leaveHandler = (onBlur?: () => void) => (e: FocusEvent<HTMLElement>) => {
  if (onBlur && !e.currentTarget.contains(e.relatedTarget as Node | null)) onBlur();
};

/**
 * ref 指向可聚焦的元素（React Hook Form 錯誤時聚焦、自行 focus() 用）。
 * root：元件根元素；selector：根元素裡要聚焦的那個（沒有就用根元素）
 */
export function useFieldRef(ref: ForwardedRef<HTMLElement>, root: RefObject<HTMLElement | null>, selector?: string) {
  useImperativeHandle(ref, () => ((selector && root.current?.querySelector<HTMLElement>(selector)) || root.current) as HTMLElement);
}

/**
 * 原生表單送出用的隱藏欄位（有給 name 才輸出）：
 * boolean＝勾選時送 "on"（同原生 checkbox，沒勾不送）；string[]＝每個值一個欄位；其餘轉字串
 */
export function FormValue({ name, value, disabled }: { name?: string; value: unknown; disabled?: boolean }) {
  if (!name) return null;
  if (typeof value === 'boolean') return value ? <input type="hidden" name={name} value="on" disabled={disabled} /> : null;
  if (Array.isArray(value)) return <>{value.map((v) => <input key={String(v)} type="hidden" name={name} value={String(v)} disabled={disabled} />)}</>;
  return <input type="hidden" name={name} value={value == null ? '' : String(value)} disabled={disabled} />;
}

/** 表單整合的共用 props（11 個會產生值的元件都有） */
export interface FieldProps {
  /** 原生表單欄位名稱：有給才輸出隱藏欄位，FormData 拿得到值 */
  name?: string;
  disabled?: boolean;
  /** 焦點離開整個元件時呼叫（標記 touched） */
  onBlur?: () => void;
}
