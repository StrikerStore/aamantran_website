'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import PhoneField from '@/components/PhoneField';
import { CommerceShell } from '@/components/commerce/CommerceShell';
import ui from '@/components/commerce/commerceForm.module.css';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { getPaymentStatus } from '@/lib/api/checkout';
import { clearCheckoutDraft, readCheckoutDraft, type CheckoutDraft } from '@/lib/checkoutDraft';
import { BUILDER_STEPS } from '@/lib/content/builderSteps';
import { SELF_BUILD } from '@/lib/content/entitlements';
import { TRY_DEMO } from '@/lib/content/tryDemo';
import {
  PENDING_RECHECK_MS,
  firstAccountError,
  parseOnboardingAddress,
  phaseForStatus,
  validateAccount,
  type AccountErrors,
  type AccountField,
  type OnboardingAddress,
  type Phase,
  type UsernameCheck,
} from '@/lib/onboarding';
import { getFbq } from '@/lib/metaPixel';
import { getCoupleDashboardUrl, getPublicApiUrl } from '@/lib/publicEnv';
import { CURRENCY } from '@/lib/storefront';
import { track, trackOnce } from '@/lib/track';
import styles from './onboarding.module.css';

const API = getPublicApiUrl();
const USER_DASHBOARD_URL = getCoupleDashboardUrl();

type EmailCheck = 'idle' | 'checking' | 'found' | 'new';

const noSubscription = () => () => {};

/**
 * The checkout draft is read once per address and then held: onboarding clears
 * it once setup finishes, and re-reading it would change the snapshot and
 * remount the form under the buyer's fingers.
 */
const draftSnapshots = new Map<string, string>();
function draftSnapshotFor(search: string, slug: string): string {
  let snapshot = draftSnapshots.get(search);
  if (snapshot === undefined) {
    snapshot = JSON.stringify(slug ? readCheckoutDraft({ templateSlug: slug }) : null);
    draftSnapshots.set(search, snapshot);
  }
  return snapshot;
}

/**
 * After payment: confirm where the payment stands, then create the account (or
 * add the purchase to an existing one) and point the buyer at the builder.
 *
 * Reads the address and the checkout draft as external stores, then mounts the
 * flow keyed on them, so the server renders the neutral "checking" state and the
 * first client render starts with the real values.
 */
export default function OnboardingClient() {
  const search = useSyncExternalStore(noSubscription, () => window.location.search, () => '');
  const address = useMemo(() => parseOnboardingAddress(search), [search]);
  const draftJson = useSyncExternalStore(noSubscription, () => draftSnapshotFor(search, address.slug), () => 'null');
  const draft = useMemo(() => JSON.parse(draftJson) as CheckoutDraft | null, [draftJson]);
  const hydrated = useSyncExternalStore(noSubscription, () => true, () => false);

  if (!hydrated) {
    return (
      <CommerceShell label="Account setup" width="narrow">
        <div className={ui.section}>
          <p className={styles.status} role="status">Checking your payment…</p>
        </div>
      </CommerceShell>
    );
  }
  return <OnboardingFlow key={`${search}|${draftJson}`} address={address} draft={draft} />;
}

function OnboardingFlow({ address, draft }: { address: OnboardingAddress; draft: CheckoutDraft | null }) {
  const router = useRouter();
  const { paymentId, slug, templateName, orderId, amountMinor, currency: purchaseCurrency } = address;
  const id = useId();
  const fieldId = (field: AccountField) => `${id}-${field}`;

  const [phase, setPhase] = useState<Phase>(paymentId ? 'checking' : 'missing');
  // The purchase may be counted: paid, or the status could not be read (see phaseForStatus).
  const [confirmed, setConfirmed] = useState(false);
  const [statusRun, setStatusRun] = useState(0);

  // Field state — email and number carried over from checkout in this tab.
  const [email, setEmail] = useState(draft?.email ?? '');
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState(draft?.contactNational ?? '');
  const [contactCountryCode, setContactCountryCode] = useState(draft?.contactCountryCode || (CURRENCY === 'USD' ? '+1' : '+91'));
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status state
  const [emailStatus, setEmailStatus] = useState<EmailCheck>('idle');
  const [autofillUser, setAutofillUser] = useState(''); // fetched from lookup
  const [usernameStatus, setUsernameStatus] = useState<UsernameCheck>('idle');
  const [isLinkedFlow, setIsLinkedFlow] = useState(false); // true = same account

  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [prefilled, setPrefilled] = useState(false); // details carried in from a demo
  const [linkedResult, setLinkedResult] = useState(false);
  const [message, setMessage] = useState('');

  const summaryRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  // ── Where does the payment stand? ────────────────────────────────────
  useEffect(() => {
    if (!paymentId) return;
    const controller = new AbortController();
    let timer = 0;
    async function check(recheck: number) {
      const res = await getPaymentStatus(paymentId, controller.signal);
      if (controller.signal.aborted || (!res.ok && res.aborted)) return;
      const next = phaseForStatus(
        res.ok
          ? { ok: true, status: res.data.status, registered: res.data.registered, templateSlug: res.data.templateSlug }
          : { ok: false, httpStatus: res.status, message: res.message },
        recheck,
      );
      setPhase(next.phase);
      setConfirmed(next.confirmed);
      if (next.recheckAgain) timer = window.setTimeout(() => void check(recheck + 1), PENDING_RECHECK_MS);
      if (next.phase === 'failed') {
        // A failed payment belongs back at checkout, filled in, with the reason.
        const target = (res.ok && res.data.templateSlug) || slug;
        router.replace(target ? `/checkout/${encodeURIComponent(target)}?payment=failed&reason=failed` : '/?payment=failed&reason=failed');
      }
    }
    void check(0);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [paymentId, slug, router, statusRun]);

  // Landing here means PayU redirected after a successful payment — record the
  // purchase once per payment (deduped across reloads within the browser session).
  // Held until the payment is confirmed, so a pending or failed one is never counted.
  useEffect(() => {
    if (!paymentId || !confirmed) return;
    trackOnce(`purchase_${paymentId}`, 'purchase', { slug, orderId });

    // Meta Pixel Purchase. Fired here rather than at checkout so it only counts
    // payments PayU actually confirmed. Tagged with eventID so Meta dedupes on
    // its side too (and can match a future Conversions API event).
    const key = `aam_fbq_purchase_${paymentId}`;
    try {
      if (sessionStorage.getItem(key)) return; // already sent this payment
    } catch {
      // storage blocked — fall through and send anyway
    }

    // The pixel is injected by the consent gate in the layout, whose effect runs
    // *after* this one, so fbq may not exist yet. Retry briefly, and only mark
    // the event as sent once it has actually gone out.
    let attempts = 0;
    const send = () => {
      const fbq = getFbq();
      if (!fbq) return false;
      fbq('track', 'Purchase', {
        value: amountMinor / 100,
        // What the buyer was actually charged in. Reporting a dollar sale as
        // rupees would misstate every ad metric built on it.
        currency: purchaseCurrency,
        content_ids: [slug],
        content_name: templateName,
        content_type: 'product',
      }, { eventID: paymentId });
      try { sessionStorage.setItem(key, '1'); } catch { /* storage blocked */ }
      return true;
    };

    if (send()) return;
    const timer = setInterval(() => {
      // Give up after ~2s — consent was likely declined, so no pixel will load.
      if (send() || ++attempts >= 20) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, [paymentId, confirmed, slug, orderId, amountMinor, templateName, purchaseCurrency]);

  // ── Email lookup: an existing account adds the purchase to itself ─────
  //
  // Deliberately depends on nothing: it must run when the email changes and at
  // no other time. (It used to depend on the linked flow, so choosing a
  // different username re-ran the lookup and put the old one straight back —
  // a repeat customer could not create a separate account.)
  const autofillRef = useRef('');
  const lookupEmail = useCallback(async (raw: string) => {
    const em = raw.trim().toLowerCase();
    if (!em || !em.includes('@')) { setEmailStatus('new'); return; }
    setEmailStatus('checking');
    try {
      const res = await fetch(`${API}/api/checkout/lookup-email?email=${encodeURIComponent(em)}`);
      const data = await res.json();
      if (data.exists) {
        setEmailStatus('found');
        const previous = autofillRef.current;
        autofillRef.current = data.username;
        setAutofillUser(data.username);
        // Only fill the box while the buyer has not chosen a username themselves.
        setUsername((current) => (current.trim() === '' || current === previous ? data.username : current));
      } else {
        setEmailStatus('new');
        const previous = autofillRef.current;
        autofillRef.current = '';
        setAutofillUser('');
        setUsername((current) => (current === previous ? '' : current));
      }
    } catch {
      setEmailStatus('new');
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => lookupEmail(email), 500);
    return () => window.clearTimeout(t);
  }, [email, lookupEmail]);

  // ── Username availability (new accounts only) ────────────────────────
  const checkUsername = useCallback(async (raw: string) => {
    const u = raw.trim();
    if (!u) { setUsernameStatus('idle'); return; }
    setUsernameStatus('checking');
    try {
      const res = await fetch(`${API}/api/checkout/check-username?username=${encodeURIComponent(u)}`);
      const data = await res.json();
      setUsernameStatus(!data.available ? (data.reason === 'invalid' ? 'invalid' : 'taken') : 'available');
    } catch {
      setUsernameStatus('idle');
    }
  }, []);

  // Whether this is still the existing account is decided in one place: the
  // username in the box is that account's. Anything else is a new account, which
  // needs a password and an availability check.
  useEffect(() => {
    const u = username.trim();
    const linked = Boolean(autofillUser) && u === autofillUser;
    setIsLinkedFlow(linked);
    if (linked) { setUsernameStatus('linked'); return; }
    if (!u) { setUsernameStatus('idle'); return; }
    setUsernameStatus('checking');
    const t = window.setTimeout(() => checkUsername(u), 450);
    return () => window.clearTimeout(t);
  }, [username, autofillUser, checkUsername]);

  const passwordRequired = !isLinkedFlow;
  const errors: AccountErrors = validateAccount({ email, username, usernameStatus, contactCountryCode, contact, password, passwordRequired });
  const shown = (field: AccountField) => (attempted ? errors[field] : undefined);
  const stillChecking = emailStatus === 'checking' || usernameStatus === 'checking';

  function focusSoon(getElement: () => HTMLElement | null) {
    window.requestAnimationFrame(() => getElement()?.focus());
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setAttempted(true);
    setMessage('');
    if (firstAccountError(errors)) {
      focusSoon(() => summaryRef.current);
      return;
    }
    if (stillChecking) {
      setMessage('Still checking your email and username — try again in a moment.');
      focusSoon(() => messageRef.current);
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, string> = {
        paymentId,
        templateSlug: slug,
        username: username.trim(),
        email: email.trim(),
        contact: contact.trim(),
        contactCountryCode,
      };
      if (passwordRequired) body.password = password;

      const res = await fetch(`${API}/api/checkout/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Registration failed');
      track('register_complete', { slug });
      // Set up: the checkout draft has done its job. Kept until now so a reload
      // of this page still starts with the email and number from checkout.
      clearCheckoutDraft();
      setPrefilled(data?.prefilled === true);
      setLinkedResult(data?.linked === true);
      setPhase('done');
      focusSoon(() => doneRef.current);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
      focusSoon(() => messageRef.current);
    } finally {
      setSubmitting(false);
    }
  }

  const describedBy = (field: AccountField, hint?: string) =>
    [hint, shown(field) ? `${fieldId(field)}-error` : ''].filter(Boolean).join(' ') || undefined;
  const errorLine = (field: AccountField) =>
    shown(field) && (
      <p id={`${fieldId(field)}-error`} className={ui.error}>
        <span aria-hidden="true">⚠ </span>
        {shown(field)}
      </p>
    );
  const errorList = attempted ? (Object.entries(errors) as [AccountField, string][]) : [];

  const purchase = (
    <div className={styles.purchase}>
      <p className={styles.purchaseLabel}>Your invitation</p>
      <p className={styles.purchaseName}>{templateName}</p>
      {orderId && (
        <p className={ui.small}>
          Order <strong>{orderId}</strong> — keep this for any support questions.
        </p>
      )}
    </div>
  );

  // ── Screens ──────────────────────────────────────────────────────────
  if (phase === 'checking' || phase === 'pending') {
    return (
      <CommerceShell label="Account setup" width="narrow">
        <div className={ui.section}>
          {purchase}
          <p className={styles.status} role="status" aria-live="polite">
            <span className={ui.spinner} aria-hidden="true" />
            {phase === 'checking' ? 'Checking your payment…' : 'Confirming your payment with the bank…'}
          </p>
        </div>
      </CommerceShell>
    );
  }

  if (phase === 'failed') {
    return (
      <CommerceShell label="Account setup" width="narrow">
        <div className={ui.section}>
          <p className={styles.status} role="status">Your payment didn’t go through. Taking you back to checkout…</p>
        </div>
      </CommerceShell>
    );
  }

  if (phase === 'stillPending') {
    return (
      <CommerceShell label="Account setup" width="narrow">
        <div className={ui.section}>
          {purchase}
          <Notice tone="info" title="Your payment is still being confirmed" live="polite">
            Your bank hasn’t confirmed it yet. This usually takes a few minutes. When it’s confirmed we email you the link to
            set up your account, or you can check again here.
          </Notice>
          <Button onClick={() => { setPhase('checking'); setStatusRun((n) => n + 1); }}>Check again</Button>
          <p className={ui.small}>
            Please don’t pay again while it’s being confirmed. <Link href="/contact" target="_blank">Contact us</Link> if it
            hasn’t cleared within the hour.
          </p>
        </div>
      </CommerceShell>
    );
  }

  if (phase === 'missing') {
    return (
      <CommerceShell label="Account setup" width="narrow">
        <div className={ui.section}>
          <h1 className={styles.title}>We couldn’t find this purchase</h1>
          <p>
            This link is missing its payment reference or doesn’t match a purchase. Open the link in your purchase email,
            or contact us with your order number and we’ll set it up.
          </p>
          <div className={styles.actions}>
            <a href={USER_DASHBOARD_URL} className={ui.pay}>Log in to your dashboard</a>
            <Link href="/contact">Contact support</Link>
          </div>
        </div>
      </CommerceShell>
    );
  }

  if (phase === 'registered' || phase === 'done') {
    const justNow = phase === 'done';
    return (
      <CommerceShell label="Account setup" width="narrow">
        <div className={ui.section}>
          <p className={styles.tick} aria-hidden="true">✓</p>
          <h1 ref={doneRef} tabIndex={-1} className={styles.title}>
            {justNow ? (linkedResult ? 'Added to your account' : 'Your account is ready') : 'This purchase is already set up'}
          </h1>
          {purchase}
          {justNow && prefilled && <p className={styles.prefilled}>{TRY_DEMO.onboardingNote}</p>}
          <a href={USER_DASHBOARD_URL} className={ui.pay}>
            Open your dashboard
          </a>
          <p className={ui.small}>
            Log in with {justNow ? <>the username <strong>{username.trim().toLowerCase()}</strong></> : 'the username and password you set up'}.
          </p>
        </div>

        <section className={`${ui.section} ${styles.next}`} aria-labelledby={`${id}-next`}>
          <h2 id={`${id}-next`} className={ui.sectionTitle}>{SELF_BUILD.onboardingNext}</h2>
          <p className={ui.small}>In your dashboard, the builder takes you through these steps. Next saves each one.</p>
          <ol className={styles.steps}>
            {BUILDER_STEPS.map((step) => (
              <li key={step.id}>
                <span className={styles.stepLabel}>{step.label}</span>
                <span className={ui.small}>{step.youEnter}</span>
              </li>
            ))}
          </ol>
        </section>
      </CommerceShell>
    );
  }

  // phase === 'form'
  return (
    <CommerceShell label="Account setup" width="narrow">
      <div className={ui.section}>
        <p className={styles.paid}>
          <span aria-hidden="true">✓ </span>Payment confirmed
        </p>
        {purchase}
        <h1 className={styles.title}>{isLinkedFlow ? 'Add this purchase to your account' : 'Create your account'}</h1>
        <p className={ui.small}>
          {isLinkedFlow
            ? 'You already have an Aamantran account with this email, so this invitation will be added to it.'
            : 'Your account is where you build the invitation, share it and see RSVPs.'}
        </p>
      </div>

      <form className={styles.form} noValidate onSubmit={onSubmit}>
        {errorList.length > 0 && (
          <div ref={summaryRef} tabIndex={-1} role="alert" className={ui.errorSummary}>
            <p className={ui.errorSummaryTitle}>
              {errorList.length === 1 ? 'One thing to fix:' : `${errorList.length} things to fix:`}
            </p>
            <ul>
              {errorList.map(([field, text]) => (
                <li key={field}>
                  <a
                    href={`#${fieldId(field)}`}
                    onClick={(event) => {
                      event.preventDefault();
                      document.getElementById(fieldId(field))?.focus();
                    }}
                  >
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={ui.section}>
          <div className={ui.field}>
            <label htmlFor={fieldId('email')}>Email</label>
            <input
              id={fieldId('email')}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              className={ui.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={shown('email') ? true : undefined}
              aria-describedby={describedBy('email', `${fieldId('email')}-hint`)}
              disabled={submitting}
            />
            <p id={`${fieldId('email')}-hint`} className={ui.hint} aria-live="polite">
              {emailStatus === 'checking'
                ? 'Checking for an existing account…'
                : emailStatus === 'found'
                  ? 'Welcome back — we found your account.'
                  : 'Use the email you paid with.'}
            </p>
            {errorLine('email')}
          </div>

          <div className={ui.field}>
            <label htmlFor={fieldId('username')}>Username</label>
            <input
              id={fieldId('username')}
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              className={ui.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={shown('username') ? true : undefined}
              aria-describedby={describedBy('username', `${fieldId('username')}-hint`)}
              disabled={submitting}
            />
            <p id={`${fieldId('username')}-hint`} className={ui.hint} aria-live="polite">
              {isLinkedFlow
                ? 'This is your existing username. Change it only if you want a separate new account.'
                : usernameStatus === 'checking'
                  ? 'Checking availability…'
                  : usernameStatus === 'available'
                    ? 'This username is available.'
                    : usernameStatus === 'taken'
                      ? 'That username is taken.'
                      : '3–32 letters, numbers, dots, underscores or hyphens. You log in with it.'}
            </p>
            {!isLinkedFlow && autofillUser && username.trim() !== autofillUser && (
              <p className={ui.hint}>A new username creates a separate account, so set a password below.</p>
            )}
            {errorLine('username')}
          </div>

          <div className={ui.field}>
            <label htmlFor={fieldId('contact')}>Mobile number</label>
            <PhoneField
              id={fieldId('contact')}
              countryCode={contactCountryCode}
              number={contact}
              placeholder={CURRENCY === 'USD' ? 'Phone number' : '10-digit mobile number'}
              disabled={submitting}
              invalid={Boolean(shown('contact'))}
              describedBy={describedBy('contact', `${fieldId('contact')}-hint`)}
              onChange={({ countryCode, number }) => {
                setContactCountryCode(countryCode);
                setContact(number);
              }}
            />
            <p id={`${fieldId('contact')}-hint`} className={ui.hint}>
              Saved on your account. Changing it later needs a support request.
            </p>
            {errorLine('contact')}
          </div>

          {passwordRequired && (
            <div className={ui.field}>
              <label htmlFor={fieldId('password')}>Password</label>
              <div className={styles.passwordRow}>
                <input
                  id={fieldId('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={ui.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={shown('password') ? true : undefined}
                  aria-describedby={describedBy('password', `${fieldId('password')}-hint`)}
                  disabled={submitting}
                />
                <Button
                  variant="secondary"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-controls={fieldId('password')}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
              </div>
              <p id={`${fieldId('password')}-hint`} className={ui.hint}>At least 8 characters.</p>
              {errorLine('password')}
            </div>
          )}
        </div>

        {message && (
          <div ref={messageRef} tabIndex={-1} role="alert" className={ui.submitError}>
            <p className={ui.errorSummaryTitle}>We couldn’t finish setting up</p>
            <p>{message}</p>
          </div>
        )}

        <button type="submit" className={ui.pay} disabled={submitting} aria-busy={submitting || undefined}>
          {submitting && <span className={ui.spinner} aria-hidden="true" />}
          {submitting ? 'Setting up…' : isLinkedFlow ? 'Add to my account' : 'Create my account'}
        </button>

        <p className={`${ui.small} ${styles.center}`}>
          By {isLinkedFlow ? 'adding this purchase' : 'creating an account'} you agree to our{' '}
          <Link href="/terms" target="_blank">Terms of Service</Link> and{' '}
          <Link href="/privacy" target="_blank">Privacy Policy</Link>.
        </p>
        <p className={`${ui.small} ${styles.center}`}>
          Already set this purchase up? <a href={USER_DASHBOARD_URL}>Go to your dashboard</a>
        </p>
      </form>
    </CommerceShell>
  );
}
