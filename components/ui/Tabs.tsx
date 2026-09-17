'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { nextTabIndex } from './tabsKeyboard';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

/**
 * WAI-ARIA tabs with a roving tabindex.
 *
 * Only the selected tab is in the Tab order; Arrow keys, Home and End move
 * between tabs and select them immediately. Every panel stays mounted, and the
 * inactive ones are hidden, so their content is still server-rendered.
 * Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`.
 */
export function Tabs({
  items,
  label,
  defaultValue,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  /** Accessible name for the tab list, e.g. "Planning tools". */
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
}) {
  const baseId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? items[0]?.id);
  const selectedId = value ?? uncontrolled;
  const selectedIndex = Math.max(0, items.findIndex((item) => item.id === selectedId));
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;

  function select(index: number, moveFocus: boolean) {
    const item = items[index];
    if (!item) return;
    if (value === undefined) setUncontrolled(item.id);
    if (item.id !== items[selectedIndex]?.id) onChange?.(item.id);
    if (moveFocus) tabRefs.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const next = nextTabIndex(event.key, selectedIndex, items.length);
    if (next === null) return;
    event.preventDefault();
    select(next, true);
  }

  return (
    <div className={cx(styles.tabs, className)}>
      <div role="tablist" aria-label={label} className={styles.list}>
        {items.map((item, index) => {
          const selected = index === selectedIndex;
          return (
            <button
              key={item.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={tabId(item.id)}
              aria-selected={selected}
              aria-controls={panelId(item.id)}
              tabIndex={selected ? 0 : -1}
              className={cx(styles.tab, selected && styles.selected)}
              onClick={() => select(index, false)}
              onKeyDown={handleKeyDown}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item, index) => (
        <div
          key={item.id}
          role="tabpanel"
          id={panelId(item.id)}
          aria-labelledby={tabId(item.id)}
          tabIndex={0}
          hidden={index !== selectedIndex}
          className={styles.panel}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
