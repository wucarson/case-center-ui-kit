import { useRef, useState } from 'react';
import { Checkbox, Combo, DatePicker, MultiSelect, PeriodPicker, RadioGroup, Segmented, Switch, TagSearch, TextField, TimePicker } from '@wucarson/facet-react';
import { FORM_CASES, FORM_TODAY } from '../../shared/forms';

const P = Object.fromEntries(FORM_CASES.map((c) => [c.name, c.props as Record<string, any>]));
const initial = () => Object.fromEntries(FORM_CASES.map((c) => [c.field, structuredClone(c.initial)])) as Record<string, any>;

/** FormData → 物件：照規格的型別還原（boolean＝有沒有送；string[]＝全部；number＝轉數字） */
function readForm(form: HTMLFormElement) {
  const fd = new FormData(form);
  return Object.fromEntries(FORM_CASES.map((c) => [c.field,
    c.type === 'boolean' ? fd.has(c.field) : c.type === 'string[]' ? fd.getAll(c.field) : c.type === 'number' ? Number(fd.get(c.field)) : (fd.get(c.field) ?? '')]));
}

/**
 * 表單整合測試頁（?forms）：受控 value＋onChange（同 React Hook Form 的 Controller），每個元件都給 name；
 * 送出讀原生 <form> 的 FormData，驗證隱藏欄位送得出去。tools/form-check.mjs 照 apps/shared/forms.ts 驗收。
 */
export function FormsDemo() {
  const [data, setData] = useState(initial);
  const [disabled, setDisabled] = useState<Record<string, boolean>>({});
  const touched = useRef<Record<string, boolean>>({});
  const form = useRef<HTMLFormElement>(null);
  const f = (field: string) => ({
    name: field,
    disabled: !!disabled[field],
    onBlur: () => { touched.current[field] = true; },
    onChange: (v: unknown) => setData((d) => ({ ...d, [field]: v })),
  });
  // window.__forms：每次渲染更新（閉包拿到最新的資料）
  (window as any).__forms = {
    value: () => data,
    set: (name: string, v: unknown) => setData((d) => ({ ...d, [name]: v })),
    disable: (name: string) => setDisabled((d) => ({ ...d, [name]: true })),
    enable: (name: string) => setDisabled((d) => ({ ...d, [name]: false })),
    touched: (name: string) => !!touched.current[name],
    reset: () => setData(initial()),
    submit: () => readForm(form.current!),
  };
  return (
    <form ref={form} className="forms" onSubmit={(e) => e.preventDefault()}>
      <div className="fcase" data-c="form-field"><TextField {...f('title')} label={P['form-field'].label} value={data.title} onChange={(e) => f('title').onChange(e.target.value)} /></div>
      <div className="fcase" data-c="combo"><Combo {...f('kind')} value={data.kind} items={P.combo.items} label={P.combo.label} selfLabelled /></div>
      <div className="fcase" data-c="multi-select"><MultiSelect {...f('depts')} value={data.depts} options={P['multi-select'].options} noun={P['multi-select'].noun} inlineMenu /></div>
      <div className="fcase" data-c="date-picker"><DatePicker {...f('due')} value={data.due} label={P['date-picker'].label} today={FORM_TODAY} /></div>
      <div className="fcase" data-c="period-picker"><PeriodPicker {...f('period')} value={data.period} today={FORM_TODAY} /></div>
      <div className="fcase" data-c="time-picker"><TimePicker {...f('start')} value={data.start} label={P['time-picker'].label} /></div>
      <div className="fcase" data-c="checkbox"><Checkbox {...f('notify')} checked={data.notify} label={P.checkbox.label} /></div>
      <div className="fcase" data-c="radio-group"><RadioGroup {...f('groupBy')} value={data.groupBy} options={P['radio-group'].options} aria-label="分組方式" /></div>
      <div className="fcase" data-c="switch"><Switch {...f('remind')} checked={data.remind} label={P.switch.label} /></div>
      <div className="fcase" data-c="segmented"><Segmented {...f('range')} value={data.range} options={P.segmented.options} aria-label="時間範圍" /></div>
      <div className="fcase" data-c="tag-search"><TagSearch {...f('q')} value={data.q} tags={P['tag-search'].tags} label={P['tag-search'].label} /></div>
    </form>
  );
}
