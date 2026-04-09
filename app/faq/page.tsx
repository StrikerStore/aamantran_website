'use client';

import { useState } from 'react';
import Link from 'next/link';

function FaqItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-q" aria-expanded={open} onClick={() => setOpen(o => !o)}>{q}</button>
      <div className="faq-a">{a}</div>
    </div>
  );
}

const CATEGORIES = [
  {
    title: 'Getting started',
    faqs: [
      { q: 'How do I place an order?', a: <span>Choose a template on the <Link href="/templates">templates page</Link>, pay securely for your <strong>digital e-invitation</strong> (no physical printed cards are shipped), and you&apos;ll set up your couple dashboard. From there, fill in your details and your invitation is live — no waiting, no approvals.</span> },
      { q: 'How long does it take to get my invitation?', a: 'Your invitation is live the moment you finish setting it up in your dashboard. Most couples complete their setup in under 30 minutes — pick a template, fill in your details, and your link is ready to share.' },
      { q: 'What information do I need to provide?', a: "You'll need to share: the names of the couple, wedding date(s), venue name(s) and addresses, list of functions/events (Haldi, Sangeet, Wedding, Reception etc.), and any photos you'd like included." },
      { q: 'Can I see a sample before ordering?', a: 'Yes! You can view a live demo invitation on our website. Click "View live demo" on the homepage to see exactly how your guests will experience your invitation — the animation, RSVP flow, and all.' },
    ],
  },
  {
    title: 'Design & customisation',
    faqs: [
      { q: 'Can I choose my own template?', a: "Absolutely. Browse our template gallery and tell us which design you love. We'll personalise it with your names, dates, venues, and events." },
      { q: 'Can I add my own photos?', a: 'Yes — photo gallery is included. You can share pre-wedding shoot photos, candid family moments, or any images that tell your story.' },
      { q: 'Can I add background music?', a: "Yes. Background music is included. You can choose any song — share the track name or a file and we'll embed it so it plays gently as guests scroll through your invitation." },
      { q: 'Can I make changes after the invitation goes live?', a: 'Yes. Log back into your couple dashboard anytime, edit any detail — venue, timing, photo, date — and your live invitation updates instantly. Your link stays the same.' },
    ],
  },
  {
    title: 'Sharing & RSVP',
    faqs: [
      { q: 'How do guests RSVP?', a: "Guests open your invitation link in their browser and tap the RSVP button. They fill in their name, select which events they're attending, add any meal preference if applicable, and submit. You see every response instantly on your couple dashboard — no app needed for guests." },
      { q: 'How do I share the invitation on WhatsApp?', a: "We provide you with a short, shareable URL that looks beautiful in WhatsApp with a rich card preview. We can generate personalised links per guest that auto-fill their name in the RSVP form." },
      { q: 'Can guests RSVP to individual functions separately?', a: "Yes — this is one of Aamantran's core features. Guests can RSVP yes or no to each event (Haldi, Sangeet, Wedding, Reception) independently. Your dashboard shows per-event headcounts." },
      { q: 'Do guests need to download an app?', a: "Not at all. Your invitation is a web link that opens in any browser — Chrome, Safari, or any default mobile browser. No downloads, no sign-ups, no friction for your guests." },
    ],
  },
  {
    title: 'Pricing & payment',
    faqs: [
      { q: 'Will I receive printed invitations or any physical product?', a: 'No. Aamantran is a digital service only. You receive an e-invitation (online invitation) that you share by link — for example on WhatsApp. No printed cards, envelopes, or other physical items are produced or delivered.' },
      { q: 'Are there any recurring charges?', a: "None. You pay once and your invitation stays live. No subscriptions, no renewals, no hidden fees." },
      { q: 'What payment methods do you accept?', a: "We accept UPI, all major credit/debit cards, and net banking via our secure payment processor." },
      { q: 'Can I upgrade my plan after purchasing?', a: "Yes. Contact us and we'll sort it out immediately." },
    ],
  },
  {
    title: 'Technical & hosting',
    faqs: [
      { q: 'How long will my invitation stay live?', a: "Your invitation stays live for the duration of your plan. Contact us to extend it if needed." },
      { q: 'What if my event is postponed?', a: "No problem. Log into your dashboard and update the date yourself — changes go live instantly at no extra charge. Your existing link and all RSVP data are preserved." },
      { q: 'Does the invitation work on all devices?', a: "Yes. Every invitation is fully responsive and works beautifully on all smartphones, tablets, and desktops — Android, iOS, Windows, Mac." },
      { q: 'Is my guest data safe?', a: <span>Your guest data belongs to you. We never share, sell, or use it for marketing. Guest RSVP data is automatically deleted 90 days after your event date. Read more in our <Link href="/privacy">Privacy Policy</Link>.</span> },
    ],
  },
];

export default function FaqPage() {
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
        {CATEGORIES.map(cat => (
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
