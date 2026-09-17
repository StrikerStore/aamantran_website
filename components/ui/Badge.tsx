import type { ComponentProps } from 'react';
import { cx } from '@/lib/cx';
import styles from './Badge.module.css';

type Tone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'error';

/** Short label (occasion, capability, status). Tone is never the only signal: the text carries the meaning. */
export function Badge({ tone = 'neutral', className, ...rest }: { tone?: Tone } & ComponentProps<'span'>) {
  return <span {...rest} className={cx(styles.badge, styles[tone], className)} />;
}
