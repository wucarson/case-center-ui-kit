import { ICONS, type IconName } from '../../../shared/icons';
import { cx } from './util';

/** <Icon name="trash" />：輸出和展示牆相同的 <svg class="ic"> */
export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={cx('ic', className)} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] }} />
  );
}
