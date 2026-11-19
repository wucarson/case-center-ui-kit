/**
 * 只要 class 的顯示元件：參數 → class、圖示、role 的對應表。
 * 提示訊息、空狀態、狀態徽章、流程步驟、歷程、骨架（contracts/ 各一份）。
 */
import type { IconName } from '../shared/icons';
import { cx } from './dom';

/* ---- 提示訊息 callout ---- */
export type CalloutTone = 'info' | 'success' | 'warn' | 'danger' | 'neutral';
const CALLOUT_CLS: Record<CalloutTone, string> = { info: 'info', success: 'ok', warn: 'warn', danger: 'dng', neutral: 'neu' };
export const CALLOUT_ICON: Record<CalloutTone, IconName> = { info: 'info', success: 'ok', warn: 'warn', danger: 'error', neutral: 'info' };
export const calloutClass = (tone: CalloutTone, compact?: boolean) => cx('co', CALLOUT_CLS[tone], compact && 'cpt');
/** danger 一律念；live＝操作後才出現、要讓讀屏念出來 */
export const calloutRole = (tone: CalloutTone, live?: boolean) => (tone === 'danger' ? 'alert' : live ? 'status' : null);

/* ---- 空狀態 empty-state ---- */
/** info＝還沒有內容；warn＝篩選後查無結果；danger＝載入失敗 */
export type EmptyTone = 'info' | 'warn' | 'danger';
export const EMPTY_ICON: Record<EmptyTone, IconName> = { info: 'emptyList', warn: 'noResult', danger: 'failed' };
export const emptyClass = (tone: EmptyTone) => cx('es', tone);
export const emptyRole = (tone: EmptyTone) => (tone === 'danger' ? 'alert' : 'status');

/* ---- 狀態徽章 status-badge ---- */
export type BadgeTone = 'plan' | 'active' | 'pause' | 'closed' | 'danger' | 'none';
export type BadgeAppearance = 'filled' | 'outline' | 'plain';
const BADGE_TONE: Record<BadgeTone, string> = { plan: 't-q', active: 't-a', pause: 't-p', closed: 't-c', danger: 't-d', none: 't-q' };
/** 圓點：tone="none" 預設不顯示 */
export const badgeDot = (tone: BadgeTone, showIndicator?: boolean) => showIndicator ?? tone !== 'none';
export const badgeClass = (tone: BadgeTone, appearance: BadgeAppearance = 'filled', dot = true) =>
  cx('bdg', BADGE_TONE[tone], appearance === 'outline' && 'ol', appearance === 'plain' && 'pl', !dot && 'nodot');

/* ---- 流程步驟 stepper ---- */
export type StepState = 'done' | 'cur' | 'todo';
/** 目前階段之前都算完成（current＝-1：都還沒開始） */
export const stepState = (index: number, current: number): StepState => (index < current ? 'done' : index === current ? 'cur' : 'todo');
/** 未開始且沒有補充時顯示「未開始」 */
export const stepNote = (state: StepState, note?: string) => note ?? (state === 'todo' ? '未開始' : '');

/* ---- 歷程 timeline ---- */
/** edit＝變更、新增；done＝完成、通過；due＝時間、期限相關 */
export type TimelineType = 'edit' | 'done' | 'due';
export const TIMELINE_CLS: Record<TimelineType, string> = { edit: 'a', done: 'b', due: 'c' };
export const TIMELINE_ICON: Record<TimelineType, IconName> = { edit: 'edit', done: 'check', due: 'due' };

/* ---- 骨架 skeleton ---- */
export const skeletonClass = (loading: boolean) => cx('sk', !loading && 'loaded');
/** 頭像底色：分類色 1–4 */
export const avatarBg = (color: 1 | 2 | 3 | 4) => `var(--cat${color})`;

/* ---- 頭像群組 avatar-group：重疊排列，滑過時展開；超過 max 收成 +N，右邊寫總人數。 ---- */
export interface AvatarPerson {
  name: string;
  /** 頭像上的字，通常是姓 */
  initial: string;
  /** 分類色 1–4（--cat1…--cat4） */
  color: 1 | 2 | 3 | 4;
}
export const avatarStackClass = (spread: boolean) => cx('stack', spread && 'spread');
export const avatarShown = (people: AvatarPerson[], max = 3) => people.slice(0, max);
export const avatarRest = (people: AvatarPerson[], max = 3) => Math.max(0, people.length - max);
export const avatarNames = (people: AvatarPerson[]) => people.map((p) => p.name).join('、');
export const avatarStyle = (p: AvatarPerson) => ({ '--a': `var(--cat${p.color})` });
export const avatarTotal = (people: AvatarPerson[]) => `共 ${people.length} 位`;
