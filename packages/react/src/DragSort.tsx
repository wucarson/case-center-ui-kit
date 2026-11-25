import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import {
  sortAnnounce, sortClampY, sortHandleLabel, sortHeight, sortKey, sortLand, sortMin, sortMove, sortRowClass, sortSlot, sortToggle, sortY,
  SORT_STEP, type SortItem,
} from '@wucarson/facet-core/sort';
import { Icon } from './Icon';
import { cx, styleOf } from './util';

export type { SortItem };

export interface DragSortProps {
  /** 目前順序；開頭的 locked 列固定不動 */
  items: SortItem[];
  /** 放下或切換開關後的新順序 */
  onChange?: (items: SortItem[]) => void;
  /** 清單名稱，例：「欄位顯示順序」 */
  'aria-label'?: string;
  className?: string;
  style?: string | CSSProperties;
}

const GRIP = <svg className="ic" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>' }} />;

/** 拖移排序：拖握把調整順序，其他列滑開讓位，原位留虛線空位；握把聚焦後 ↑↓ 移動。規則在 core/sort.ts。 */
export function DragSort({ items, onChange, className, style, ...aria }: DragSortProps) {
  // 拖移中用自己的順序；放下才通知外面
  const [order, setOrder] = useState(items);
  const [held, setHeld] = useState<{ key: string; y: number } | null>(null);
  const [say, setSay] = useState('');
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!held) setOrder(items); }, [items]);
  const n = order.length, min = sortMin(order);
  const index = (key: string) => order.findIndex((x) => x.key === key);
  const land = (key: string) => requestAnimationFrame(() => sortLand(box.current?.querySelector(`[data-key="${CSS.escape(key)}"]`)));
  const commit = (next: SortItem[]) => { setOrder(next); onChange?.(next); };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>, key: string) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const y0 = e.clientY, base = index(key) * SORT_STEP;
    let cur = order;
    setHeld({ key, y: base });
    const h = e.currentTarget;
    const move = (ev: globalThis.PointerEvent) => {
      const y = sortClampY(base + ev.clientY - y0, min, n), from = cur.findIndex((x) => x.key === key), to = sortSlot(y, min, n);
      if (to !== from) { cur = sortMove(cur, from, to); setOrder(cur); }
      setHeld({ key, y });
    };
    const up = () => {
      h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up);
      setHeld(null); land(key);
      if (cur !== order) { onChange?.(cur); const i = cur.findIndex((x) => x.key === key); setSay(sortAnnounce(cur[i].label, i, n)); }
    };
    h.addEventListener('pointermove', move); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
  };

  return (
    <div ref={box} className={cx('drg', className)} role="list" aria-label={aria['aria-label']} style={{ height: sortHeight(n), ...(styleOf(style) ?? {}) }}>
      <i className={cx('drg-ph', held && 'show')} style={held ? { transform: sortY(index(held.key)) } : undefined} />
      {items.map((it) => {
        const i = index(it.key), cur = order[i] ?? it, lifted = held?.key === it.key;
        return (
          <div key={it.key} data-key={it.key} className={sortRowClass(cur, lifted)} role="listitem" style={{ transform: sortY(i, lifted ? held!.y : undefined) }}>
            {it.locked
              ? <span className="drg-h lk" title="固定欄位"><Icon name="lock" /></span>
              : (
                <button
                  className="drg-h"
                  type="button"
                  aria-label={sortHandleLabel(it.label, i, n)}
                  onPointerDown={(e) => onPointerDown(e, it.key)}
                  onKeyDown={(e) => {
                    const to = sortKey(i, min, n, e.key);
                    if (to === null) return;
                    e.preventDefault();
                    if (to === i) return;
                    commit(sortMove(order, i, to)); land(it.key); setSay(sortAnnounce(it.label, to, n));
                  }}
                >
                  {GRIP}
                </button>
              )}
            <span className="drg-n">{it.label}</span>
            <button className="drg-s" type="button" role="switch" aria-checked={!!cur.visible} aria-label={`顯示${it.label}`} disabled={it.locked} onClick={() => commit(sortToggle(order, it.key))}>
              <span className="tg"><i /></span>
            </button>
          </div>
        );
      })}
      <span role="status" style={SR}>{say}</span>
    </div>
  );
}
const SR: CSSProperties = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };
