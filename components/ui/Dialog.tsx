'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Dialog.module.css';

/**
 * Modal dialog on the native <dialog> element.
 *
 * The browser provides the focus trap, Escape handling and the inert page
 * behind it. This component adds what the platform does not do everywhere:
 * - focus returns to whatever was focused before it opened;
 * - the page behind stops scrolling while it is open;
 * - a click on the backdrop closes it;
 * - onClose fires for every way it closes (button, Escape, backdrop), so the
 *   parent's `open` state never drifts from the element.
 *
 * Children render only while open unless `keepMounted`, so heavy content such
 * as a demo iframe is not loaded until the visitor asks for it.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  fullScreenOnMobile = false,
  keepMounted = false,
  closeLabel = 'Close',
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  size?: 'md' | 'lg';
  fullScreenOnMobile?: boolean;
  keepMounted?: boolean;
  closeLabel?: string;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const previousOverflow = useRef('');
  const openRef = useRef(open);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  // Latest props for the native event handlers below.
  useEffect(() => {
    openRef.current = open;
    onCloseRef.current = onClose;
  });

  // Keep the element in step with the `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      previousOverflow.current = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Every close path (button, Escape, backdrop, prop) ends in the native close event.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleClose() {
      document.documentElement.style.overflow = previousOverflow.current;
      returnFocusTo.current?.focus();
      returnFocusTo.current = null;
      // Closed by Escape or the backdrop while the parent still says open.
      if (openRef.current) onCloseRef.current();
    }

    function handleClick(event: MouseEvent) {
      // The content wrapper fills the dialog box, so only a backdrop click
      // targets the <dialog> element itself.
      if (event.target === dialog) dialog?.close();
    }

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('click', handleClick);
    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('click', handleClick);
      // Never leave the page scroll-locked if we unmount while open.
      if (dialog.open) document.documentElement.style.overflow = previousOverflow.current;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cx(styles.dialog, size === 'lg' && styles.lg, fullScreenOnMobile && styles.fullMobile, className)}
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.close}
            aria-label={closeLabel}
            onClick={() => dialogRef.current?.close()}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        {description && (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        )}
        <div className={styles.body}>{(open || keepMounted) && children}</div>
      </div>
    </dialog>
  );
}
