import type { CSSProperties } from 'react';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export interface StepperStep {
  label: string;
  /** 補充：完成日、負責人・進行中；未開始可省略（顯示「未開始」） */
  note?: string;
}

export interface StepperProps {
  steps: StepperStep[];
  /** 目前階段的索引；之前的都算完成（-1＝都還沒開始） */
  current: number;
  'aria-label'?: string;
  className?: string;
  style?: string | CSSProperties;
}

/** 流程步驟：完成打勾、目前加框、未開始虛線。只顯示進度，不能點。 */
export function Stepper({ steps, current, className, style, ...aria }: StepperProps) {
  return (
    <div className={cx('fl', className)} style={styleOf(style)} role="list" aria-label={aria['aria-label']}>
      {steps.map((s, j) => {
        const st = j < current ? 'done' : j === current ? 'cur' : 'todo';
        return (
          <div key={j} className={'fs ' + st} role="listitem" aria-current={st === 'cur' ? 'step' : undefined}>
            <p><Icon name="check" />{s.label}</p>
            <small>{s.note ?? (st === 'todo' ? '未開始' : '')}</small>
          </div>
        );
      })}
    </div>
  );
}
