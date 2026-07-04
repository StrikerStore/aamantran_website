'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FAQ_CATEGORIES } from './faqData';

function FaqItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-q" aria-expanded={open} onClick={() => setOpen(o => !o)}>{q}</button>
      <div className="faq-a">{a}</div>
    </div>
  );
}

export default function FaqClient() {
  return (
    <>
      <section className="page-hero">
        <span className="page-eyebrow">Help centre</span>
        <h1 className="page-title">Frequently Asked <em>Questions</em></h1>
        <p className="page-subtitle">
          Everything you need to know about Aamantran. Can&apos;t find your answer?{' '}
          <Link href="/contact" style={{ color: 'var(--burgundy)', textDecoration: 'underline' }}>Contact us</Link>
          {' '}— we reply within a few hours.
        </p>
      </section>

      <main className="faq-page-wrap">
        {FAQ_CATEGORIES.map(cat => (
          <div key={cat.title} className="faq-category">
            <h2 className="faq-category-title" dangerouslySetInnerHTML={{ __html: cat.title.replace(/&/, '<em>&amp;</em>') }} />
            <div className="faq-list faq-accordion">
              {cat.faqs.map(faq => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        ))}

        <div className="faq-still-cta">
          <h2>Still have questions?</h2>
          <p>Drop us a message through the contact form and we&apos;ll get back to you promptly.</p>
          <Link href="/contact" className="btn-primary">Contact us →</Link>
        </div>
      </main>
    </>
  );
}
