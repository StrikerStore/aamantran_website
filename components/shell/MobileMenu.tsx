'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Accordion } from '@/components/ui/Accordion';
import { LinkButton } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import type { ShopMenu, ShopMenuLink } from '@/lib/shopMenu';
import type { NavLink } from './navigation';
import styles from './MobileMenu.module.css';

/**
 * Navigation for screens narrower than 1024px.
 *
 * Built on the shared Dialog, which already traps focus, closes on Escape,
 * locks page scroll and returns focus to this button. Choosing a link closes it.
 *
 * The Invitations panel is the same shop menu the desktop header shows — the
 * aisles in stock, then the traditions — so a phone is not offered a smaller
 * shop than a laptop.
 */
function MenuLinks({ links, onChoose, className }: { links: ShopMenuLink[]; onChoose: () => void; className: string }) {
  return (
    <ul className={className}>
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className={styles.subLink} onClick={onChoose}>
            {link.label}
            {' '}
              {link.count !== null && (
              <span className={styles.count}>
                {link.count}
                <span className="visually-hidden"> {link.count === 1 ? 'design' : 'designs'}</span>
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function MobileMenu({
  menu,
  primaryLinks,
  dashboardUrl,
}: {
  menu: ShopMenu;
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
                  <>
                    {menu.occasions.length > 0 && (
                      <>
                        <p className={styles.groupTitle}>By occasion</p>
                        <MenuLinks links={menu.occasions} onChoose={close} className={styles.subList} />
                      </>
                    )}
                    <p className={styles.groupTitle}>By tradition</p>
                    <MenuLinks links={menu.traditions} onChoose={close} className={styles.subList} />
                    <ul className={styles.subList}>
                      <li>
                        <Link href={menu.all.href} className={styles.subLink} onClick={close}>
                          {menu.all.label}
                          {' '}
              {menu.all.count !== null && (
                            <span className={styles.count}>
                              {menu.all.count}
                              <span className="visually-hidden"> {menu.all.count === 1 ? 'design' : 'designs'}</span>
                            </span>
                          )}
                        </Link>
                      </li>
                    </ul>
                  </>
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
