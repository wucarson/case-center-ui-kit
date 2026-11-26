import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, type FormGroup } from '@angular/forms';
import { inject } from '@angular/core';
import { Checkbox, Combo, DatePicker, FieldControl, FormField, MultiSelect, PeriodPicker, RadioGroup, Segmented, Switch, TagSearch, TimePicker } from '@wucarson/facet-angular';
import { FORM_CASES, FORM_TODAY } from '../../shared/forms';

const C = Object.fromEntries(FORM_CASES.map((c) => [c.name, c]));
const P = (n: string) => C[n].props as Record<string, any>;

/** 表單整合測試頁（?forms）：每個元件用 formControlName 接上同一個 FormGroup；tools/form-check.mjs 照 apps/shared/forms.ts 驗收 */
@Component({
  selector: 'cc-demo',
  imports: [ReactiveFormsModule, FormField, FieldControl, Combo, MultiSelect, DatePicker, PeriodPicker, TimePicker, Checkbox, RadioGroup, Switch, Segmented, TagSearch],
  template: `<form class="forms" [formGroup]="form" (ngSubmit)="submitted = form.getRawValue()">
  <div class="fcase" data-c="form-field"><div ccFormField [label]="p('form-field').label" htmlFor="f-title"><input ccFieldControl id="f-title" formControlName="title" /></div></div>
  <div class="fcase" data-c="combo"><div ccCombo formControlName="kind" [items]="p('combo').items" [label]="p('combo').label" selfLabelled></div></div>
  <div class="fcase" data-c="multi-select"><div ccMultiSelect formControlName="depts" [options]="p('multi-select').options" [noun]="p('multi-select').noun" inlineMenu></div></div>
  <div class="fcase" data-c="date-picker"><div ccDatePicker formControlName="due" [label]="p('date-picker').label" [today]="today"></div></div>
  <div class="fcase" data-c="period-picker"><div ccPeriodPicker formControlName="period" [today]="today"></div></div>
  <div class="fcase" data-c="time-picker"><div ccTimePicker formControlName="start" [label]="p('time-picker').label"></div></div>
  <div class="fcase" data-c="checkbox"><div ccCheckbox formControlName="notify" [label]="p('checkbox').label"></div></div>
  <div class="fcase" data-c="radio-group"><div ccRadioGroup formControlName="groupBy" [options]="p('radio-group').options" aria-label="分組方式"></div></div>
  <div class="fcase" data-c="switch"><div ccSwitch formControlName="remind" [label]="p('switch').label"></div></div>
  <div class="fcase" data-c="segmented"><div ccSegmented formControlName="range" [options]="p('segmented').options" aria-label="時間範圍"></div></div>
  <div class="fcase" data-c="tag-search"><div ccTagSearch formControlName="q" [tags]="p('tag-search').tags" [label]="p('tag-search').label"></div></div>
</form>`,
})
export class FormsDemo {
  protected readonly today = FORM_TODAY;
  protected readonly p = P;
  protected submitted: unknown = null;
  // nonNullable：reset() 回到初始值，不是 null
  readonly form: FormGroup = inject(FormBuilder).nonNullable.group(
    Object.fromEntries(FORM_CASES.map((c) => [c.field, [c.initial, c.name === 'form-field' ? Validators.required : []]])),
  );

  constructor() {
    const f = this.form;
    (window as any).__forms = {
      value: () => f.getRawValue(),
      set: (name: string, v: unknown) => f.controls[name].setValue(v),
      disable: (name: string) => f.controls[name].disable(),
      enable: (name: string) => f.controls[name].enable(),
      touched: (name: string) => f.controls[name].touched,
      reset: () => f.reset(),
      submit: () => f.getRawValue(),
    };
  }
}
