'use client';

import { useState } from 'react';
import { getPublicApiUrl } from '@/lib/publicEnv';
import PhoneField from '@/components/PhoneField';
import { IS_INTL } from '@/lib/storefront';

const API = getPublicApiUrl();

/*
 * This form carried `noValidate`, which switches off HTML5 validation
 * entirely -- so `required` and type="email" rendered the asterisks but
 * enforced nothing, and the form submitted happily with an empty phone. The
 * manual check that stood in for it omitted phone as well, as did the server.
 *
 * Validation is now explicit here AND in the route, rather than relying on
 * browser behaviour that one attribute can silently disable.
 */

/**
 * Mirrors the server-side rule in aamantran_backend/src/routes/contact.js.
 * The server is the authority -- this copy exists so the visitor is told what
 * is wrong before a round trip, not instead of the server checking.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Indian mobiles are ten digits starting 6-9; elsewhere, E.164 length only. */
function phoneProblem(dial: string, national: string): string | null {
  const digits = national.replace(/\D/g, '');
  if (!digits) return 'Please enter your phone number.';
  if (dial === '+91') {
    return /^[6-9]\d{9}$/.test(digits) ? null : 'Please enter a valid 10-digit Indian mobile number.';
  }
  const e164 = dial.replace(/\D/g, '') + digits;
  return e164.length >= 8 && e164.length <= 15
    ? null
    : 'Please enter a valid phone number for the country code selected.';
}

export default function ContactClient() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Controlled, because the country code is a separate value that has to travel
  // with the number -- the rest of the form stays uncontrolled as it was.
  const [dial, setDial] = useState(IS_INTL ? '+1' : '+91');
  const [phone, setPhone] = useState('');

  return (
    <>
      <section className="page-hero">
        <span className="page-eyebrow">Get in touch</span>
        <h1 className="page-title">Let&apos;s create something<br /><em>beautiful together.</em></h1>
        <p className="page-subtitle">Have a question, a special request, or ready to get started? We&apos;re just a message away — and we genuinely love helping couples.</p>
      </section>

      <main className="page-body wide">
        <div className="contact-grid">
          <div className="contact-info">
            <h2>We&apos;d love to<br /><em>hear from you.</em></h2>
            <p>Whether you&apos;re exploring options, finalising details, or need a same-day turnaround — reach out and we&apos;ll make it work.</p>

            {[
              { icon: '💬', title: 'WhatsApp (Fastest)', detail: <a href="https://wa.me/919174773644" target="_blank" rel="noopener noreferrer">+91 91747 73644</a> },
              { icon: '✉️', title: 'Email', detail: <a href="mailto:aamantran@plexzuu.com">aamantran@plexzuu.com</a> },
              { icon: '🕐', title: 'Working Hours', detail: <span>Mon – Sat, 9 AM – 9 PM IST</span> },
              { icon: '⚡', title: 'Response Time', detail: <span>Usually within 2–4 hours</span> },
            ].map(m => (
              <div key={m.title} className="contact-method">
                <div className="contact-method-icon">{m.icon}</div>
                <div className="contact-method-text">
                  <strong>{m.title}</strong>
                  {m.detail}
                </div>
              </div>
            ))}

            <p className="contact-note">
              🎁 <strong>Tip:</strong> If your wedding is within 48 hours, message us directly on WhatsApp and mention <em>&quot;urgent&quot;</em> — we&apos;ll prioritise your order immediately.
            </p>
          </div>

          <div className="contact-form-wrap">
            <h3>Send us a message</h3>
            {!submitted ? (
              <form id="contact-form" onSubmit={async (e) => {
                e.preventDefault();
                setError('');
                setSubmitting(true);
                const form = e.currentTarget;
                const data = {
                  name: (form.elements.namedItem('name') as HTMLInputElement).value,
                  phone,
                  phoneCountryCode: dial,
                  email: (form.elements.namedItem('email') as HTMLInputElement).value,
                  eventType: (form.elements.namedItem('event-type') as HTMLSelectElement).value,
                  eventDate: (form.elements.namedItem('event-date') as HTMLInputElement).value,
                  message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
                };
                // Checked in the order the fields appear, so the message names
                // the first thing the visitor needs to fix rather than a
                // generic "all required fields".
                const problem =
                  !data.name.trim()    ? 'Please enter your name.' :
                  phoneProblem(dial, phone) ??
                  (!data.email.trim()  ? 'Please enter your email address.' :
                   !EMAIL_RE.test(data.email.trim()) ? 'Please enter a valid email address.' :
                   !data.message.trim() ? 'Please tell us a little about what you need.' :
                   null);
                if (problem) {
                  setError(problem);
                  setSubmitting(false);
                  return;
                }
                try {
                  const res = await fetch(`${API}/api/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json?.message || 'Failed to send');
                  setSubmitted(true);
                } catch (err: unknown) {
                  setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
                } finally {
                  setSubmitting(false);
                }
              }}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Your name *</label>
                    <input type="text" id="name" name="name" placeholder="e.g. Priya Sharma" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone / WhatsApp *</label>
                    <PhoneField
                      id="phone"
                      countryCode={dial}
                      number={phone}
                      placeholder="98765 43210"
                      onChange={({ countryCode, number }) => { setDial(countryCode); setPhone(number); }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email address *</label>
                  <input type="email" id="email" name="email" placeholder="you@example.com" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="event-type">Type of event</label>
                    <select id="event-type" name="event-type">
                      <option value="">Select event type</option>
                      <option>Wedding</option>
                      <option>Engagement</option>
                      <option>Birthday</option>
                      <option>Baby Shower</option>
                      <option>Anniversary</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="event-date">Event date</label>
                    <input type="date" id="event-date" name="event-date" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea id="message" name="message" placeholder="Tell us about your wedding — venue, no. of functions, any special requests..." required />
                </div>
                {error && <p style={{ color: '#b42318', fontSize: '0.9rem', marginBottom: 8 }}>{error}</p>}
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send message →'}
                </button>
              </form>
            ) : (
              <div className="form-success" style={{ display: 'block' }}>
                <div className="success-icon">🎉</div>
                <h4>Message received!</h4>
                <p>Thank you for reaching out. We&apos;ll get back to you within a few hours. Meanwhile, feel free to WhatsApp us directly for an even faster response.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
