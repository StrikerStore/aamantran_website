'use client';

import { useId, useState, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Accordion.module.css';

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

/**
 * Disclosure list for questions and details.
 *
 * Each trigger is a real button inside a heading, with aria-expanded and
 * aria-controls. A collapsed panel is `inert`, so its links cannot be tabbed to
 * or read while hidden. Expansion animates the panel's grid row, which keeps
 * the question itself from moving.
 */
export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  headingLevel = 3,
  className,
}: {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  headingLevel?: 2 | 3 | 4;
  className?: string;
}) {
  const baseId = useId();
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(
    () => new Set(allowMultiple ? defaultOpen : defaultOpen.slice(0, 1)),
  );
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  function toggle(id: string) {
    setOpenIds((previous) => {
      const next = new Set<string>(allowMultiple ? previous : []);
      if (previous.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className={cx(styles.accordion, className)}>
      {items.map((item) => {
        const open = openIds.has(item.id);
        const buttonId = `${baseId}-trigger-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;
        return (
          <div key={item.id} className={cx(styles.item, open && styles.open)}>
            <Heading className={styles.heading}>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                className={styles.trigger}
                onClick={() => toggle(item.id)}
              >
                <span>{item.title}</span>
                <span className={styles.chevron} aria-hidden="true" />
              </button>
            </Heading>
            <div id={panelId} role="region" aria-labelledby={buttonId} className={styles.panel} inert={!open}>
              <div className={styles.clip}>
                <div className={styles.content}>{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
