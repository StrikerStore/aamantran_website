import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Notice.module.css';

type Tone = 'info' | 'success' | 'warning' | 'error';

const TONE_LABEL: Record<Tone, string> = { info: 'Note', success: 'Success', warning: 'Warning', error: 'Error' };
const TONE_ICON: Record<Tone, string> = { info: 'i', success: '✓', warning: '!', error: '✕' };

/**
 * An inline message.
 *
 * `live` decides whether assistive technology announces it: 'polite' for
 * outcomes the visitor is waiting on, 'assertive' only for errors that block
 * them. Leave it unset for static notes, so they are not read out on page load.
 * The tone is spelled out for screen readers and shown with an icon, never by
 * colour alone.
 */
export function Notice({
  tone = 'info',
  title,
  live,
  action,
  className,
  children,
}: {
  tone?: Tone;
  title?: ReactNode;
  live?: 'polite' | 'assertive';
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const role = live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined;
  return (
    <div role={role} className={cx(styles.notice, styles[tone], className)}>
      <span className={styles.icon} aria-hidden="true">
        {TONE_ICON[tone]}
      </span>
      <div className={styles.body}>
        {title && (
          <p className={styles.title}>
            <span className="visually-hidden">{TONE_LABEL[tone]}: </span>
            {title}
          </p>
        )}
        {children && (
          <div className={styles.content}>
            {!title && <span className="visually-hidden">{TONE_LABEL[tone]}: </span>}
            {children}
          </div>
        )}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
