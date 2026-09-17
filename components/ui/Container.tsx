import type { ComponentProps } from 'react';
import { cx } from '@/lib/cx';

/** Page-width wrapper: max 1260px with token gutters (.ds-container in styles/base.css). */
export function Container({ className, ...rest }: ComponentProps<'div'>) {
  return <div {...rest} className={cx('ds-container', className)} />;
}
