import { Fragment, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { isActivateKey } from '@case-center/core/dom';
import {
  SIDEBAR_CHEVRON, placeSidebarIndicator, sidebarBrandLabel, sidebarClass, sidebarGroupToggleClass, sidebarHasActive, sidebarInitialOpen,
  sidebarItemClass, sidebarSubClass, sidebarTipTop, toggleAt, type SidebarGroup, type SidebarItem,
} from '@case-center/core/sidebar';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export type { SidebarGroup, SidebarItem };

export interface SidebarProps {
  groups: SidebarGroup[];
  /** 目前頁的 key */
  value?: string;
  onChange?: (key: string) => void;
  /** 收合成圖示列 */
  collapsed?: boolean;
  /** 點品牌列切換收合 */
  onCollapsedChange?: (collapsed: boolean) => void;
  brand?: { logo: string; name: string };
  user?: { name: string; initial: string };
  'aria-label'?: string;
  className?: string;
  style?: string | CSSProperties;
}

const enter = (fn: () => void) => (e: KeyboardEvent) => { if (isActivateKey(e.key)) { e.preventDefault(); fn(); } };

/** 側邊選單：選中＝淡主色底＋填滿圖示，選中片彈性滑動；群組可收合；可收合成圖示列（滑過顯示名稱）。規則在 core/sidebar.ts。 */
export function Sidebar({ groups, value, onChange, collapsed = false, onCollapsedChange, brand, user, className, style, ...aria }: SidebarProps) {
  const [open, setOpen] = useState(() => sidebarInitialOpen(groups));
  const [tip, setTip] = useState<{ text: string; top: number } | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const ind = useRef<HTMLElement>(null);
  const has = sidebarHasActive(groups, value);
  useLayoutEffect(() => placeSidebarIndicator(list.current, ind.current), [value, collapsed, open]);
  const showTip = (el: HTMLElement, text: string) => { if (collapsed && list.current) setTip({ text, top: sidebarTipTop(list.current, el) }); };
  const item = (it: SidebarItem) => {
    const on = it.key === value;
    return (
      <span
        key={it.key}
        className={sidebarItemClass(on)}
        role="link"
        tabIndex={0}
        aria-current={on ? 'page' : undefined}
        onClick={() => onChange?.(it.key)}
        onKeyDown={enter(() => onChange?.(it.key))}
        onMouseEnter={(e) => showTip(e.currentTarget, it.label)}
        onMouseLeave={() => setTip(null)}
      >
        <Icon name={it.icon} className="ln" /><Icon name={it.icon} fill /><span>{it.label}</span>{it.count != null && <b>{it.count}</b>}
      </span>
    );
  };
  const toggle = (k: number) => setOpen((o) => toggleAt(o, k));
  const fold = onCollapsedChange;
  return (
    <div className={cx(sidebarClass(collapsed), className)} style={styleOf(style)}>
      <nav className="sd" aria-label={aria['aria-label']}>
        {brand && (
          <div className="sd-brand" role={fold ? 'button' : undefined} tabIndex={fold ? 0 : undefined} aria-label={fold ? sidebarBrandLabel(collapsed) : undefined} aria-expanded={fold ? !collapsed : undefined} onClick={() => fold?.(!collapsed)} onKeyDown={enter(() => fold?.(!collapsed))}>
            <i className="sd-logo">{brand.logo}</i><b>{brand.name}</b>
          </div>
        )}
        <div ref={list} className="sd-list">
          {has && <i ref={ind} className="sd-ind" aria-hidden="true" />}
          {groups.map((g, k) =>
            g.collapsible ? (
              <Fragment key={k}>
                <span className={sidebarGroupToggleClass(open[k])} role="button" tabIndex={0} aria-expanded={open[k]} onClick={() => toggle(k)} onKeyDown={enter(() => toggle(k))}>
                  {g.label}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: SIDEBAR_CHEVRON }} />
                </span>
                <div className={sidebarSubClass(open[k])}><div>{g.items.map(item)}</div></div>
              </Fragment>
            ) : (
              <Fragment key={k}><span className="sd-g">{g.label}</span>{g.items.map(item)}</Fragment>
            ),
          )}
        </div>
        {user && <div className="sd-me"><i className="av">{user.initial}</i><span>{user.name}</span></div>}
      </nav>
      {collapsed && <span className={cx('sd-tip', tip && 'show')} style={tip ? { top: tip.top } : undefined} aria-hidden="true">{tip?.text}</span>}
    </div>
  );
}
