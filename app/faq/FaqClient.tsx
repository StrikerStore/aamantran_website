'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Accordion } from '@/components/ui/Accordion';
import { FAQ_CATEGORIES } from '@/lib/content/faqs';
import styles from './faq.module.css';

/**
 * The help centre: every question, searchable in the page.
 *
 * The search filters what is already here rather than asking the server, so it
 * answers instantly and works offline once the page has loaded. With no search
 * term the full list is shown, so the page is complete for a visitor who never
 * types anything — and for a crawler.
 */
export default function FaqClient() {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();

  const categories = useMemo(() => {
    if (!term) return FAQ_CATEGORIES;
    return FAQ_CATEGORIES
      .map((category) => ({
        ...category,
        faqs: category.faqs.filter((faq) => `${faq.q} ${faq.a}`.toLowerCase().includes(term)),
      }))
      .filter((category) => category.faqs.length > 0);
  }, [term]);

  const matches = categories.reduce((count, category) => count + category.faqs.length, 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.search}>
        <label htmlFor="faq-search" className={styles.label}>
          Search the help centre
        </label>
        <input
          id="faq-search"
          type="search"
          className={styles.input}
          value={query}
          placeholder="RSVP, GST, names, refund…"
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
        />
        <p className={styles.status} role="status">
          {term ? `${matches} ${matches === 1 ? 'question' : 'questions'} match “${query.trim()}”` : ''}
        </p>
      </div>

      {matches === 0 ? (
        <p className={styles.empty}>
          Nothing here matches “{query.trim()}”. <Link href="/contact">Ask us directly</Link> and we will answer — and
          add it here if others are likely to wonder the same.
        </p>
      ) : (
        categories.map((category) => (
          <section key={category.id} aria-labelledby={`faq-${category.id}`} className={styles.category}>
            <h2 id={`faq-${category.id}`} className={styles.categoryTitle}>
              {category.title}
            </h2>
            <Accordion
              // Remounts when the search changes, so the first match opens.
              key={`${category.id}-${term}`}
              headingLevel={3}
              defaultOpen={term ? [category.faqs[0].id] : []}
              items={category.faqs.map((faq) => ({
                id: faq.id,
                title: faq.q,
                content: (
                  <p>
                    {faq.a}
                    {faq.link && (
                      <>
                        {' '}
                        <Link href={faq.link.href}>{faq.link.label}</Link>
                      </>
                    )}
                  </p>
                ),
              }))}
            />
          </section>
        ))
      )}
    </div>
  );
}
