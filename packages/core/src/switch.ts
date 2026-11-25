/**
 * 開關（contracts/switch.json）的共用邏輯：立即生效，不用再按儲存。
 * 外殼只負責渲染與接事件；class、aria、鍵盤規則都從這裡取，各框架才會一致。
 */
import { cx } from './dom';

export interface SwitchState {
  checked: boolean;
  disabled?: boolean;
  /** sm＝欄位面板、表格內 */
  size?: 'md' | 'sm';
}

/** Space／Enter 切換 */
export const isSwitchToggleKey = (key: string) => key === ' ' || key === 'Enter';

/** 按下或按鍵後的新值；停用時回傳 null（不切換） */
export const switchNext = (s: SwitchState): boolean | null => (s.disabled ? null : !s.checked);

/** 外層 .tgr 的 class */
export const switchRootClass = (s: SwitchState) => cx('tgr', s.checked && 'on', s.disabled && 'dis');

/** 軌道 .tg 的 class；focusVisible＝鍵盤聚焦時畫焦點框 */
export const switchTrackClass = (s: SwitchState, focusVisible: boolean) => cx('tg', s.size === 'sm' && 'sm', focusVisible && 'is-focus');

/** 外層的 role、aria、tabindex（值為 null 時不輸出） */
export interface SwitchRootAttrs {
  role: 'switch';
  'aria-checked': 'true' | 'false';
  'aria-disabled': 'true' | null;
  tabindex: '0' | '-1';
}

export const switchRootAttrs = (s: SwitchState): SwitchRootAttrs => ({
  role: 'switch',
  'aria-checked': s.checked ? 'true' : 'false',
  'aria-disabled': s.disabled ? 'true' : null,
  tabindex: s.disabled ? '-1' : '0',
});
