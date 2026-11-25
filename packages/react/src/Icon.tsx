import { ICONS, ICONS_FILL, type FillIconName, type IconName } from '@wucarson/facet-core/icons';
import { cx } from './util';

/** <Icon name="trash" />：輸出和展示牆相同的 <svg class="ic">；fill＝填滿版（<svg class="ic fl">，選中時顯示） */
export function Icon({ name, fill, className }: { name: IconName; fill?: boolean; className?: string }) {
  const html = fill ? ICONS_FILL[name as FillIconName] : ICONS[name];
  return (
    <svg className={cx('ic', fill && 'fl', className)} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
