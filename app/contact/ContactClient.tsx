'use client';

import { useState, type FormEvent } from 'react';
import PhoneField from '@/components/PhoneField';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Field, TextArea, TextInput } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { getPublicApiUrl } from '@/lib/publicEnv';
import { SUPPORT, SUPPORT_RESPONSE_TIME } from '@/lib/content/claims';
import { IS_INTL } from '@/lib/storefront';
import page from '../content-page.module.css';
import styles from './contact.module.css';

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

const EVENT_TYPES = ['Wedding', 'Engagement', 'Birthday', 'Baby Shower', 'Anniversary', 'Other'];

export default function ContactClient() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Controlled, because the country code is a separate value that has to travel
  // with the number -- the rest of the form stays uncontrolled as it was.
  const [dial, setDial] = useState(IS_INTL ? '+1' : '+91');
  const [phone, setPhone] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const form = event.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      phone,
      phoneCountryCode: dial,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      eventType: (form.elements.namedItem('event-type') as HTMLSelectElement).value,
      eventDate: (form.elements.namedItem('event-date') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };
    // Checked in the order the fields appear, so the message names the first
    // thing the visitor needs to fix rather than a generic "all required fields".
    const problem =
      !data.name.trim() ? 'Please enter your name.' :
      phoneProblem(dial, phone) ??
      (!data.email.trim() ? 'Please enter your email address.' :
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
  }

  return (
    <div className={page.page}>
      <header className={page.hero}>
        <Container>
          <p className={page.eyebrow}>Get in touch</p>
          <h1 className={page.title}>Ask us anything</h1>
          <p className={page.intro}>
            Before you buy or after — a question about a design, a detail you cannot find, or something that has gone
            wrong. We answer {SUPPORT.hours}, {SUPPORT_RESPONSE_TIME.value}.
          </p>
        </Container>
      </header>

      <Container>
        <div className={styles.layout}>
          <section aria-labelledby="ways-heading">
            <h2 id="ways-heading" className={page.sectionTitle}>
              Ways to reach us
            </h2>
            <ul className={styles.methods}>
              <li>
                <span className={styles.methodTitle}>WhatsApp, the fastest</span>
                <a href={SUPPORT.whatsappHref} target="_blank" rel="noopener noreferrer">
                  {SUPPORT.whatsappLabel}
                </a>
              </li>
              <li>
                <span className={styles.methodTitle}>Email</span>
                <a href={`mailto:${SUPPORT.email}`}>{SUPPORT.email}</a>
              </li>
              <li>
                <span className={styles.methodTitle}>When we are here</span>
                <span>{SUPPORT.hours}</span>
              </li>
              <li>
                <span className={styles.methodTitle}>Already bought an invitation?</span>
                <span>Raise a ticket from your dashboard — it reaches us with your event attached.</span>
              </li>
            </ul>
            <p className={page.note}>
              <strong>Wedding in the next few days?</strong> Message us on WhatsApp and say so. We will put your
              questions to the front of the queue. We cannot build the invitation for you, but we can make sure nothing
              holds you up while you do.
            </p>
          </section>

          <section aria-labelledby="form-heading" className={styles.formCard}>
            <h2 id="form-heading" className={page.sectionTitle}>
              Send a message
            </h2>

            {submitted ? (
              <Notice tone="success" title="Message received" live="polite">
                Thank you — we will reply to the email or number you gave us. For anything urgent, WhatsApp is quicker.
              </Notice>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form} id="contact-form">
                <Field label="Your name" required id="name">
                  {(control) => <TextInput {...control} name="name" autoComplete="name" placeholder="e.g. Priya Sharma" />}
                </Field>

                <div className={styles.phoneField}>
                  <label htmlFor="phone" className={styles.label}>
                    Phone or WhatsApp <span aria-hidden="true">*</span>
                  </label>
                  <PhoneField
                    id="phone"
                    countryCode={dial}
                    number={phone}
                    placeholder="98765 43210"
                    onChange={({ countryCode, number }) => {
                      setDial(countryCode);
                      setPhone(number);
                    }}
                  />
                </div>

                <Field label="Email address" required id="email">
                  {(control) => <TextInput {...control} name="email" type="email" autoComplete="email" placeholder="you@example.com" />}
                </Field>

                <div className={styles.row}>
                  <Field label="Type of event" id="event-type">
                    {(control) => (
                      <select {...control} name="event-type" className={styles.select}>
                        <option value="">Select event type</option>
                        {EVENT_TYPES.map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                    )}
                  </Field>
                  <Field label="Event date" id="event-date">
                    {(control) => <TextInput {...control} name="event-date" type="date" />}
                  </Field>
                </div>

                <Field label="Message" required id="message">
                  {(control) => (
                    <TextArea
                      {...control}
                      name="message"
                      placeholder="Tell us what you need — the design you are looking at, your ceremonies, or what has gone wrong."
                    />
                  )}
                </Field>

                {error && (
                  <Notice tone="error" live="assertive">
                    {error}
                  </Notice>
                )}

                <Button type="submit" loading={submitting} fullWidth>
                  {submitting ? 'Sending…' : 'Send message'}
                </Button>
              </form>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}
