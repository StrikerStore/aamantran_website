'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FOOTER_FAQS = [
  {
    q: 'How long does it take to get my invitation?',
    a: 'Your invitation is live the moment you finish setup in your dashboard — most couples are done in under 30 minutes.',
  },
  {
    q: 'Can I make changes after the invitation is live?',
    a: 'Yes — log back into your dashboard anytime and edit any detail. Changes go live instantly, no re-publishing needed.',
  },
  {
    q: 'How do guests RSVP?',
    a: 'Guests tap a button inside your invitation, fill in their name and attendance for each event, and submit. You see every response instantly on your dashboard.',
  },
  {
    q: 'Do I need to install anything?',
    a: "Nothing at all. Your invitation is a web link — guests open it in any browser, no app required. It works perfectly on every phone, tablet, and desktop.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button
        className="faq-q"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {q}
      </button>
      <div className="faq-a">{a}</div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        {/* Left */}
        <div className="footer-left">
          <div className="footer-brand-col">
            <Image
              src="/logo.png"
              alt=""
              width={48}
              height={48}
              className="footer-brand-logo"
            />
            <h2 className="footer-brand-heading">Digital<br />Invitations<br />for Indian<br />Weddings</h2>
            <p className="footer-by-plexzuu">Aamantran by PLEXZUU</p>
          </div>

          <div className="footer-contact-col">
            <p className="footer-help">Need any help?<br />We&apos;ve got your back.</p>
            <a href="mailto:aamantran@plexzuu.com" className="footer-email-link">aamantran@plexzuu.com</a>
            <div className="footer-socials">
              <a href="#" className="footer-social-icon" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" className="footer-social-icon" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-info-col">
            <h5 className="footer-col-title">Information</h5>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact us</Link>
            <Link href="/faq">FAQs</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/refund">Refund Policy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>

        {/* CTA card */}
        <div className="footer-cta-card">
          <div className="footer-cta-text">
            <h3 className="footer-cta-h3">Invite Your Guests<br />in 10 Minutes!</h3>
            <p className="footer-cta-sub">Choose. Customise. Share.</p>
          </div>
          <div className="footer-cta-visual">
            <Image src="/couple.jpg" alt="Wedding couple" className="footer-couple-img" width={120} height={170} style={{ objectFit: 'contain', objectPosition: 'bottom' }} />
          </div>
          <Link href="/templates" className="btn-footer-cta">Open couple dashboard</Link>
        </div>
      </div>

      {/* FAQ strip */}
      <div className="footer-faq">
        <div className="footer-faq-inner">
          <h4 className="footer-faq-title">
            Frequently asked questions{' '}
            <Link href="/faq" className="footer-faq-all">View all →</Link>
          </h4>
          <div className="faq-accordion" id="footer-faq-accordion">
            {FOOTER_FAQS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Aamantran. Made with ❤️ for Indian celebrations.</p>
      </div>
    </footer>
  );
}
