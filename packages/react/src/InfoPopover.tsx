import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { onOutsidePointer } from '@wucarson/facet-core/dom';
import { POPOVER_DELAY, PopoverControl, placePopoverArrow, popoverButtonLabel, popoverId, popoverKey } from '@wucarson/facet-core/overlay';
import { Icon } from './Icon';
import { cx, styleOf, useFocusVisible } from './util';

export interface InfoPopoverProps {
  /** 標籤（ⓘ 放在它後面） */
  label: string;
  /** 說明：只寫重點，不放操作 */
  children: ReactNode;
  /** 指標值與補充（選用），例：68%、3 / 5 個里程碑 */
  value?: ReactNode;
  valueNote?: ReactNode;
  defaultOpen?: boolean;
  /** 滑過多久打開（ms，預設 150） */
  openDelay?: number;
  className?: string;
  style?: string | CSSProperties;
}

/** 資訊提示：滑過 150ms 打開、點擊釘住、Esc 關閉。氣泡箭頭對準 ⓘ。規則在 core/overlay.ts。 */
export function InfoPopover({ label, children, value, valueNote, defaultOpen, openDelay = POPOVER_DELAY, className, style }: InfoPopoverProps) {
  const [{ open, pinned }, setState] = useState({ open: !!defaultOpen, pinned: false });
  const ctl = useRef<PopoverControl>();
  ctl.current ??= new PopoverControl((o, p) => setState({ open: o, pinned: p }), !!defaultOpen, openDelay);
  ctl.current.delay = openDelay;
  const { focusVisible, focusProps } = useFocusVisible();
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLSpanElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const [id] = useState(popoverId);
  useLayoutEffect(() => { if (open) placePopoverArrow(btn.current, pop.current); }, [open]);
  useEffect(() => (pinned && root.current ? onOutsidePointer(root.current, () => ctl.current!.close()) : undefined), [pinned]);
  useEffect(() => () => ctl.current?.dispose(), []);
  const c = ctl.current;
  return (
    <div ref={root} className={cx('ip', className)} style={styleOf(style)}>
      <div className="ip-l">
        {label}
        <span
          ref={btn}
          className={cx('ip-b', focusVisible && 'fc')}
          role="button"
          tabIndex={0}
          aria-label={popoverButtonLabel(label)}
          aria-expanded={open}
          aria-describedby={open ? id : undefined}
          onMouseEnter={() => c.enter()}
          onMouseLeave={() => c.leave()}
          onClick={() => c.toggle()}
          onKeyDown={(e) => {
            const r = popoverKey(e.key);
            if (r === 'toggle') { e.preventDefault(); c.toggle(); }
            else if (r === 'close') c.close();
          }}
          {...focusProps}
        >
          <Icon name="info" />
        </span>
      </div>
      {value !== undefined && <div className="ip-v">{value}{valueNote && <small>{valueNote}</small>}</div>}
      {open && <div ref={pop} id={id} className="ip-p show" role="tooltip">{children}</div>}
    </div>
  );
}
