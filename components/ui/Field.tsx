'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Field.module.css';

export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  required?: boolean;
}

/**
 * Label, hint and error wired to one control.
 *
 * The control is rendered by the caller through a render prop, which receives
 * the id and ARIA attributes so the label, hint and error are always announced
 * with it. Errors carry an icon and text, never colour alone.
 *
 *   <Field label="Email" hint="For your receipt" error={err} required>
 *     {(p) => <TextInput {...p} type="email" autoComplete="email" />}
 *   </Field>
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  id: idProp,
  className,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  id?: string;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}) {
  const generated = useId();
  const id = idProp ?? `field-${generated}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cx(styles.field, Boolean(error) && styles.invalid, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {' *'}
          </span>
        )}
      </label>
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        required: required || undefined,
      })}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ className, ...rest }: ComponentProps<'input'>) {
  return <input {...rest} className={cx(styles.control, className)} />;
}

export function TextArea({ className, ...rest }: ComponentProps<'textarea'>) {
  return <textarea {...rest} className={cx(styles.control, styles.textarea, className)} />;
}
