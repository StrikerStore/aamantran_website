'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

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
              { icon: '💬', title: 'WhatsApp (Fastest)', detail: <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer">+91 99999 99999</a> },
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
              <form id="contact-form" noValidate onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Your name *</label>
                    <input type="text" id="name" name="name" placeholder="e.g. Priya Sharma" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone / WhatsApp *</label>
                    <input type="tel" id="phone" name="phone" placeholder="+91 98765 43210" required />
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
                <button type="submit" className="btn-submit">Send message →</button>
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
