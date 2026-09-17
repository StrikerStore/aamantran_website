'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Accordion } from '@/components/ui/Accordion';
import { LinkButton } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import type { NavLink } from './navigation';
import styles from './MobileMenu.module.css';

/**
 * Navigation for screens narrower than 1024px.
 *
 * Built on the shared Dialog, which already traps focus, closes on Escape,
 * locks page scroll and returns focus to this button. Choosing a link closes it.
 */
export function MobileMenu({
  invitationLinks,
  primaryLinks,
  dashboardUrl,
}: {
  invitationLinks: NavLink[];
  primaryLinks: NavLink[];
  dashboardUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span className={styles.bars} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="visually-hidden">Menu</span>
      </button>

      <Dialog open={open} onClose={close} title="Menu" fullScreenOnMobile>
        <nav aria-label="Mobile" className={styles.nav}>
          <Accordion
            items={[
              {
                id: 'invitations',
                title: 'Invitations',
                content: (
                  <ul className={styles.subList}>
                    {invitationLinks.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className={styles.subLink} onClick={close}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ),
              },
            ]}
          />
          <ul className={styles.list}>
            {primaryLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link} onClick={close}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/blog" className={styles.link} onClick={close}>
                Guides &amp; blog
              </Link>
            </li>
          </ul>
          <div className={styles.actions}>
            <LinkButton href="/templates" fullWidth onClick={close}>
              Browse invitations
            </LinkButton>
            <LinkButton href={dashboardUrl} variant="secondary" fullWidth onClick={close}>
              Log in to your dashboard
            </LinkButton>
          </div>
        </nav>
      </Dialog>
    </>
  );
}
