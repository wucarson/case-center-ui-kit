/**
 * 側邊選單（contracts/sidebar.json）：選中＝淡主色底＋填滿圖示，選中片彈性滑動；群組可收合；可收合成圖示列（滑過顯示名稱）。
 */
import type { FillIconName } from '../shared/icons';
import { cx } from './dom';

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

export const sidebarClass = (collapsed?: boolean) => cx('sd-app', collapsed && 'mini');
export const sidebarItemClass = (on: boolean) => cx('sd-it', on && 'on');
export const sidebarGroupToggleClass = (open: boolean) => cx('sd-g sd-tg', !open && 'shut');
export const sidebarSubClass = (open: boolean) => cx('sd-sub', !open && 'shut');
/** 有選中項目才畫選中片 */
export const sidebarHasActive = (groups: SidebarGroup[], value?: string) => groups.some((g) => g.items.some((it) => it.key === value));
/** 各群組一開始是否展開 */
export const sidebarInitialOpen = (groups: SidebarGroup[]) => groups.map((g) => g.defaultOpen !== false);
export const toggleAt = (open: boolean[], k: number) => open.map((v, j) => (j === k ? !v : v));
/** 品牌列的收合鈕名稱 */
export const sidebarBrandLabel = (collapsed?: boolean) => (collapsed ? '展開側欄' : '收合側欄');
export const SIDEBAR_CHEVRON = '<path d="M6 9l6 6 6-6"/>';

/** 選中片（.sd-ind）：移到選中項目的位置與高度（量法同展示牆） */
export function placeSidebarIndicator(list: Element | null | undefined, ind: HTMLElement | null | undefined) {
  const on = list?.querySelector<HTMLElement>('.sd-it.on');
  if (on && ind) { ind.style.height = `${on.offsetHeight}px`; ind.style.transform = `translateY(${on.offsetTop}px)`; }
}
/** 收合時滑過項目：名稱提示的垂直位置 */
export const sidebarTipTop = (list: HTMLElement, el: HTMLElement) => list.offsetTop + el.offsetTop + (el.offsetHeight - 24) / 2;
