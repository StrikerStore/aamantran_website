import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'sm';

interface Appearance {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

function buttonClass({ variant = 'primary', size = 'md', fullWidth, className }: Omit<Appearance, 'children'>) {
  return cx(styles.button, styles[variant], size === 'sm' && styles.sm, fullWidth && styles.full, className);
}

/**
 * Action button. `loading` disables it and marks it busy, so a slow request
 * cannot be submitted twice; the label stays in place to avoid layout shift.
 */
export function Button({
  variant,
  size,
  fullWidth,
  className,
  loading = false,
  disabled,
  type = 'button',
  children,
  ...rest
}: Appearance & { loading?: boolean } & Omit<ComponentProps<'button'>, 'className' | 'children'>) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, fullWidth, className })}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </button>
  );
}

/** Navigation styled as a button. Use for moving to a page, Button for doing something. */
export function LinkButton({
  variant,
  size,
  fullWidth,
  className,
  children,
  ...rest
}: Appearance & Omit<ComponentProps<typeof Link>, 'className' | 'children'>) {
  return (
    <Link {...rest} className={buttonClass({ variant, size, fullWidth, className })}>
      {children}
    </Link>
  );
}
