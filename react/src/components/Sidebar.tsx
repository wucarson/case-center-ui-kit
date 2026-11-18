import { Fragment, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { FillIconName } from '../../../shared/icons';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export interface SidebarItem {
  key: string;
  label: string;
  /** 線條＋填滿兩版都有的圖示（選中時換填滿） */
  icon: FillIconName;
  /** 數量徽章 */
  count?: number;
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
  /** 可收合的群組（標題右邊有箭頭） */
  collapsible?: boolean;
  /** 可收合群組一開始是否展開（預設 true） */
  defaultOpen?: boolean;
}

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

const enter = (fn: () => void) => (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };

/** 側邊選單：選中＝淡主色底＋填滿圖示，選中片彈性滑動；群組可收合；可收合成圖示列（滑過顯示名稱）。 */
export function Sidebar({ groups, value, onChange, collapsed = false, onCollapsedChange, brand, user, className, style, ...aria }: SidebarProps) {
  const [open, setOpen] = useState(() => groups.map((g) => g.defaultOpen !== false));
  const [tip, setTip] = useState<{ text: string; top: number } | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const ind = useRef<HTMLElement>(null);
  const has = groups.some((g) => g.items.some((it) => it.key === value));
  // 選中片：量選中項目的位置（量法同展示牆）
  useLayoutEffect(() => {
    const on = list.current?.querySelector<HTMLElement>('.sd-it.on');
    if (on && ind.current) { ind.current.style.height = `${on.offsetHeight}px`; ind.current.style.transform = `translateY(${on.offsetTop}px)`; }
  }, [value, collapsed, open]);
  const showTip = (el: HTMLElement, text: string) => { if (collapsed && list.current) setTip({ text, top: list.current.offsetTop + el.offsetTop + (el.offsetHeight - 24) / 2 }); };
  const item = (it: SidebarItem) => {
    const on = it.key === value;
    return (
      <span
        key={it.key}
        className={cx('sd-it', on && 'on')}
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
  const toggle = (k: number) => setOpen((o) => o.map((v, j) => (j === k ? !v : v)));
  return (
    <div className={cx('sd-app', collapsed && 'mini', className)} style={styleOf(style)}>
      <nav className="sd" aria-label={aria['aria-label']}>
        {brand && (
          <div className="sd-brand" role={onCollapsedChange ? 'button' : undefined} tabIndex={onCollapsedChange ? 0 : undefined} aria-label={onCollapsedChange ? (collapsed ? '展開側欄' : '收合側欄') : undefined} aria-expanded={onCollapsedChange ? !collapsed : undefined} onClick={() => onCollapsedChange?.(!collapsed)} onKeyDown={enter(() => onCollapsedChange?.(!collapsed))}>
            <i className="sd-logo">{brand.logo}</i><b>{brand.name}</b>
          </div>
        )}
        <div ref={list} className="sd-list">
          {has && <i ref={ind} className="sd-ind" aria-hidden="true" />}
          {groups.map((g, k) =>
            g.collapsible ? (
              <Fragment key={k}>
                <span className={cx('sd-g sd-tg', !open[k] && 'shut')} role="button" tabIndex={0} aria-expanded={open[k]} onClick={() => toggle(k)} onKeyDown={enter(() => toggle(k))}>
                  {g.label}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                </span>
                <div className={cx('sd-sub', !open[k] && 'shut')}><div>{g.items.map(item)}</div></div>
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
