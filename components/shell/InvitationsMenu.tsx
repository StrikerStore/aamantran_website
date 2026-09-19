'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type FocusEvent } from 'react';
import type { ShopMenu, ShopMenuLink } from '@/lib/shopMenu';
import styles from './InvitationsMenu.module.css';

/**
 * The "Invitations" dropdown in the desktop header — the shop's front door.
 *
 * A disclosure — a button that shows and hides a list of links — rather than an
 * ARIA menu, because these are ordinary page links and a menu role would change
 * how screen readers expect the keyboard to behave. It closes on Escape (focus
 * returns to the button), on a click outside, when focus leaves it, and when a
 * link is chosen.
 *
 * It lists occasions first and traditions second, because that is the order a
 * customer decides in: what the celebration is, then whose it is. Counts come
 * from the live catalogue, so the menu can never offer an aisle with nothing
 * behind it.
 */
function Group({ title, links, onChoose }: { title: string; links: ShopMenuLink[]; onChoose: () => void }) {
  if (links.length === 0) return null;
  return (
    <div className={styles.group}>
      <p className={styles.groupTitle}>{title}</p>
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={styles.link} onClick={onChoose}>
              {link.label}
              {' '}
              {link.count !== null && (
                <span className={styles.count}>
                  {link.count}
                  <span className="visually-hidden"> {link.count === 1 ? 'invite' : 'invites'}</span>
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function InvitationsMenu({ menu }: { menu: ShopMenu }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

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
        <div className={styles.groups}>
          <Group title="By occasion" links={menu.occasions} onChoose={close} />
          <Group title="By tradition" links={menu.traditions} onChoose={close} />
        </div>
        <Link href={menu.all.href} className={styles.all} onClick={close}>
          {menu.all.label}
          {' '}
              {menu.all.count !== null && (
            <span className={styles.count}>
              {menu.all.count}
              <span className="visually-hidden"> {menu.all.count === 1 ? 'invite' : 'invites'}</span>
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
