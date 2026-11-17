import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';
import { CASES, type Case } from '../../shared/cases';
import '../../shared/case.css';
import { Button, Checkbox, CheckboxList, Combo, FormField, MultiSelect, RadioGroup, Segmented, Switch, TextField } from './components';
import { styleOf } from './components/util';

/** 展示頁：把 shared/cases.ts 的每個案例用元件畫出來，給 tools/compare.mjs 截圖比對 */
const RENDER: Record<string, ComponentType<any>> = {
  button: Button,
  switch: Switch,
  checkbox: (p: any) => (p.list ? <CheckboxList {...p} /> : <Checkbox {...p} />),
  'radio-group': RadioGroup,
  segmented: Segmented,
  'form-field': TextField,
  // 放在 FormField 裡的下拉／多選：field 是外框的設定
  combo: ({ field, ...p }: any) => (field ? <FormField {...field}><Combo {...p} inField /></FormField> : <Combo {...p} />),
  'multi-select': ({ field, ...p }: any) => (field ? <FormField {...field}><MultiSelect {...p} inField /></FormField> : <MultiSelect {...p} />),
};

function CaseView({ name, c }: { name: string; c: Case }) {
  const C = RENDER[name];
  const body = c.group ? c.group.map((p, i) => <C key={i} {...p} />) : <C {...c.props} />;
  return (
    <div className="case" data-c={name} data-id={c.id} data-interact={c.interact ? JSON.stringify(c.interact) : undefined}>
      {c.wrap ? (c.wrapTag === 'span' ? <span style={styleOf(c.wrap)}>{body}</span> : <div style={styleOf(c.wrap)}>{body}</div>) : body}
    </div>
  );
}

const only = new URLSearchParams(location.search).get('c');
createRoot(document.getElementById('root')!).render(
  <main className="cases">
    {Object.entries(CASES).filter(([n]) => (!only || n === only) && RENDER[n]).flatMap(([n, list]) => list.map((c) => <CaseView key={n + c.id} name={n} c={c} />))}
  </main>,
);
