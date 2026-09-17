'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type FocusEvent } from 'react';
import type { NavLink } from './navigation';
import styles from './InvitationsMenu.module.css';

/**
 * The "Invitations" dropdown in the desktop header.
 *
 * A disclosure — a button that shows and hides a list of links — rather than an
 * ARIA menu, because these are ordinary page links and a menu role would change
 * how screen readers expect the keyboard to behave. It closes on Escape (focus
 * returns to the button), on a click outside, when focus leaves it, and when a
 * link is chosen.
 */
export function InvitationsMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (open && !event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }

  return (
    <div ref={rootRef} className={styles.root} onBlur={handleBlur}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        Invitations
        <span className={styles.chevron} aria-hidden="true" />
      </button>
      <div id={panelId} className={styles.panel} hidden={!open}>
        <ul className={styles.list}>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
