'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import PhoneField from '@/components/PhoneField';
import { CommerceShell } from '@/components/commerce/CommerceShell';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { apiRequest } from '@/lib/api/client';
import { createOrder, getOffers, isDummyOrder, isRazorpayOrder, previewCoupon, verifyRazorpayPayment } from '@/lib/api/checkout';
import { openRazorpayCheckout } from '@/lib/razorpay';
import type { OfferCoupon, PriceBreakup } from '@/lib/api/types';
import {
  contactError,
  emailError,
  firstErrorField,
  initiateCheckoutKey,
  onboardingHref,
  parseCheckoutAddress,
  paymentFailedReturnKey,
  paymentFailureMessage,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutField,
} from '@/lib/checkout';
import { clearCheckoutDraft, readCheckoutDraft, saveCheckoutDraft, type CheckoutDraft } from '@/lib/checkoutDraft';
import { ACCESS, INCLUDED, SELF_BUILD } from '@/lib/content/entitlements';
import { TRY_DEMO } from '@/lib/content/tryDemo';
import { computePriceBreakdown } from '@/lib/priceMath';
import { CURRENCY, IS_INTL, formatMoney, priceFor } from '@/lib/storefront';
import { getFbq } from '@/lib/metaPixel';
import { track, trackOnce } from '@/lib/track';
import ui from '@/components/commerce/commerceForm.module.css';
import styles from './checkout.module.css';

const DUMMY_PAYMENT_MODE = String(process.env.NEXT_PUBLIC_DUMMY_PAYMENT_MODE || '').toLowerCase() === 'true';

/** The included items that hold for every design, in the order a buyer cares about. */
const INCLUDED_HERE = ['link', 'partial', 'guests', 'planning', 'support']
  .map((id) => INCLUDED.find((item) => item.id === id))
  .filter((item): item is (typeof INCLUDED)[number] => Boolean(item));

export interface CheckoutTemplate {
  slug: string;
  name: string;
  price: number;
  priceUsd: number | null;
  originalPrice: number | null;
  originalPriceUsd: number | null;
  gstPercent: number;
  image: string | null;
}

// 'paying' is the Razorpay modal sitting open over the page; 'confirming' is the
// server checking its signature. PayU has neither: it leaves the page entirely.
type Status = 'idle' | 'creatingOrder' | 'paying' | 'confirming' | 'redirecting' | 'failed';

type CouponState =
  | { kind: 'none' }
  | { kind: 'checking'; code: string }
  | { kind: 'applied'; code: string; pct: number }
  | { kind: 'refused'; code: string; message: string }
  | { kind: 'error'; code: string; message: string };

/** The figures before the server has answered. International orders are zero-rated. */
function firstPaintBreakup(template: CheckoutTemplate): PriceBreakup {
  const intl = IS_INTL && template.priceUsd != null;
  const b = computePriceBreakdown({ base: priceFor(template) ?? template.price, gstPercent: template.gstPercent, intl });
  return {
    baseAmount: b.base,
    discountAmount: 0,
    discountPct: 0,
    gstPercent: b.gstPercent,
    gstAmount: b.gst,
    finalAmount: b.total,
    currency: intl ? 'USD' : 'INR',
  };
}

/** Hand the browser to PayU with the signed fields the server produced. */
function submitPayUForm(payuUrl: string, params: Record<string, string>) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = payuUrl;
  for (const [name, value] of Object.entries(params)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value ?? '');
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

// The address and the saved draft cannot change while the page is open, so
// there is nothing to subscribe to. Both snapshots are strings, which keeps them
// stable between renders; the server's snapshot is empty.
const noSubscription = () => () => {};

/**
 * Reads what only the browser knows — the query string and the draft saved
 * before a previous payment attempt — then mounts the form with it.
 *
 * The form is keyed on that snapshot: the server renders it empty, and the
 * first client render remounts it already filled in, so no effect has to copy
 * storage into state and nothing flickers from empty to filled.
 */
export function CheckoutClient({ template }: { template: CheckoutTemplate }) {
  const search = useSyncExternalStore(noSubscription, () => window.location.search, () => '');
  const draftJson = useSyncExternalStore(
    noSubscription,
    () => JSON.stringify(readCheckoutDraft({ templateSlug: template.slug })),
    () => 'null',
  );
  const address = useMemo(() => parseCheckoutAddress(search), [search]);
  const draft = useMemo(() => JSON.parse(draftJson) as CheckoutDraft | null, [draftJson]);

  return (
    <CheckoutForm
      key={`${search}|${draftJson}`}
      template={template}
      paymentFailed={address.paymentFailed}
      failureReason={address.failureReason}
      trialToken={address.trialToken}
      draft={draft}
    />
  );
}

function CheckoutForm({
  template,
  paymentFailed,
  failureReason,
  trialToken,
  draft,
}: {
  template: CheckoutTemplate;
  paymentFailed: boolean;
  failureReason: string | null;
  trialToken: string;
  draft: CheckoutDraft | null;
}) {
  const router = useRouter();
  const { slug } = template;
  const id = useId();
  const fieldId = (field: CheckoutField) => `${id}-${field}`;

  const [email, setEmail] = useState(draft?.email ?? '');
  const [contactCountryCode, setContactCountryCode] = useState(draft?.contactCountryCode || (IS_INTL ? '+1' : '+91'));
  const [contactNational, setContactNational] = useState(draft?.contactNational ?? '');
  // Consent is never restored: it is given again on every attempt.
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<CheckoutField, boolean>>>({});
  const [attempted, setAttempted] = useState(false);

  const [couponInput, setCouponInput] = useState(draft?.couponCode ?? '');
  const [coupon, setCoupon] = useState<CouponState>(draft?.couponCode ? { kind: 'checking', code: draft.couponCode } : { kind: 'none' });
  const [breakup, setBreakup] = useState<PriceBreakup>(() => firstPaintBreakup(template));
  const [priceConfirmed, setPriceConfirmed] = useState(false);
  const [offers, setOffers] = useState<OfferCoupon[]>([]);

  const [status, setStatus] = useState<Status>('idle');
  const [submitError, setSubmitError] = useState('');

  const previewSeq = useRef(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const submitErrorRef = useRef<HTMLDivElement>(null);

  const errors: CheckoutErrors = validateCheckout({ email, contactCountryCode, contactNational, agreeTerms });
  const shown = (field: CheckoutField) => (attempted || touched[field] ? errors[field] : undefined);
  const emailValid = !emailError(email);
  const busy = status === 'creatingOrder' || status === 'paying' || status === 'confirming' || status === 'redirecting';
  const appliedCode = coupon.kind === 'applied' ? coupon.code : '';
  const money = (minor: number) => formatMoney(minor, breakup.currency || CURRENCY);

  /** Asks the server for the exact figures, with a code or without. Later answers win. */
  const runPreview = useCallback(
    async (code: string, forEmail: string) => {
      const seq = ++previewSeq.current;
      const result = await previewCoupon({ templateSlug: slug, couponCode: code, customerEmail: forEmail || undefined });
      if (seq !== previewSeq.current) return;
      if (!result.ok) {
        // The first-paint figures stay; the order is priced by the server regardless.
        if (code) setCoupon({ kind: 'error', code, message: result.message });
        return;
      }
      setBreakup(result.data.priceBreakup);
      setPriceConfirmed(true);
      if (!code) setCoupon({ kind: 'none' });
      else if (result.data.valid) setCoupon({ kind: 'applied', code, pct: result.data.priceBreakup.discountPct });
      else setCoupon({ kind: 'refused', code, message: result.data.reason || 'That code cannot be used on this order.' });
    },
    [slug],
  );

  // Once per design per session: our funnel event and Meta's InitiateCheckout.
  useEffect(() => {
    const opening = firstPaintBreakup(template);
    trackOnce(`initiate_checkout:${slug}`, 'initiate_checkout', { slug, value: opening.finalAmount / 100, currency: opening.currency });
    try {
      const key = initiateCheckoutKey(slug);
      const fbq = getFbq();
      if (fbq && !window.sessionStorage.getItem(key)) {
        window.sessionStorage.setItem(key, '1');
        fbq('track', 'InitiateCheckout', {
          value: opening.finalAmount / 100,
          currency: opening.currency,
          content_ids: [slug],
          content_name: template.name,
          content_type: 'product',
        });
      }
    } catch {
      // Storage blocked: skip the pixel rather than risk sending it on every visit.
    }
    if (paymentFailed) {
      trackOnce(paymentFailedReturnKey(failureReason), 'payment_failed_return', { slug, recovered: true, ...(failureReason ? { reason: failureReason } : {}) });
    }
  }, [slug, template, paymentFailed, failureReason]);

  // The exact price straight away, with the code from a returning draft if there is one.
  useEffect(() => {
    void runPreview(draft?.couponCode ?? '', draft?.email && !emailError(draft.email) ? draft.email.trim() : '');
    // Mount only: later previews come from the buyer's own actions below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Offers can depend on the email, and so can an applied code: both are rechecked once it is valid.
  const offersEmail = emailValid ? email.trim() : '';
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      getOffers(slug, offersEmail || undefined, controller.signal).then(setOffers).catch(() => {});
      if (appliedCode && offersEmail) void runPreview(appliedCode, offersEmail);
    }, offersEmail ? 400 : 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
    // appliedCode is read, not watched: a new code is previewed where it is applied.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, offersEmail, runPreview]);

  // Back from the payment page via the browser's back button: the page can be
  // restored exactly as it was left, mid-redirect. Make it usable again.
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) setStatus('idle');
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  function applyCode(raw: string) {
    const code = raw.trim().toUpperCase();
    setCouponInput(code);
    if (!code) {
      setCoupon({ kind: 'none' });
      void runPreview('', emailValid ? email.trim() : '');
      return;
    }
    setCoupon({ kind: 'checking', code });
    void runPreview(code, emailValid ? email.trim() : '');
  }

  function removeCode() {
    setCouponInput('');
    applyCode('');
  }

  function focusSoon(getElement: () => HTMLElement | null) {
    window.requestAnimationFrame(() => getElement()?.focus());
  }

  async function pay() {
    if (busy) return;
    setAttempted(true);
    setSubmitError('');
    const first = firstErrorField(errors);
    if (first) {
      setStatus('idle');
      focusSoon(() => summaryRef.current);
      return;
    }
    if (paymentFailed) track('checkout_retry', { slug, ...(failureReason ? { reason: failureReason } : {}) });

    setStatus('creatingOrder');
    const order = await createOrder({
      templateSlug: slug,
      couponCode: appliedCode || undefined,
      customerEmail: email.trim(),
      customerContact: contactNational,
      customerContactCountryCode: contactCountryCode,
      consent: true,
      marketingOptIn,
      ...(trialToken ? { trialToken } : {}),
    });

    if (!order.ok) {
      setStatus('failed');
      setSubmitError(order.message);
      track('checkout_error', { slug, stage: 'order', status: order.status });
      focusSoon(() => submitErrorRef.current);
      return;
    }

    // Kept for a failed or cancelled payment: the buyer comes back to this form filled in.
    saveCheckoutDraft({
      templateSlug: slug,
      email: email.trim(),
      contactCountryCode,
      contactNational,
      couponCode: appliedCode,
    });

    if (isDummyOrder(order.data)) {
      const mock = await apiRequest<unknown>('POST', '/api/checkout/mock-success', { body: { paymentId: order.data.paymentId } });
      if (!mock.ok) {
        setStatus('failed');
        setSubmitError(mock.message);
        track('checkout_error', { slug, stage: 'mock', status: mock.status });
        focusSoon(() => submitErrorRef.current);
        return;
      }
      clearCheckoutDraft();
      setStatus('redirecting');
      router.push(onboardingHref({
        paymentId: order.data.paymentId,
        slug,
        templateName: template.name,
        orderId: order.data.orderId,
        amount: order.data.amount,
        currency: order.data.priceBreakup?.currency || breakup.currency,
      }));
      return;
    }

    // ── Razorpay: a modal over this page, not a redirect away from it ────────
    //
    // Nothing the modal hands back is trusted. The payment becomes real only
    // when the server has checked its signature, which is what the confirming
    // step below does. A buyer who closes the tab before that is covered by
    // Razorpay's webhook, which does the same job server to server.
    if (isRazorpayOrder(order.data)) {
      setStatus('paying');
      const outcome = await openRazorpayCheckout(order.data.razorpay);

      if (outcome.kind === 'unavailable') {
        setStatus('failed');
        setSubmitError('We could not open the payment window. Check your connection, or any ad blocker, and try again — nothing has been charged.');
        track('checkout_error', { slug, stage: 'razorpay_script' });
        focusSoon(() => submitErrorRef.current);
        return;
      }

      if (outcome.kind === 'dismissed') {
        // Closing the window is a decision, not a failure. Back to the form,
        // still filled in, with nothing charged.
        setStatus('idle');
        setSubmitError('Payment window closed. This order was not placed — your details are still here when you’re ready.');
        focusSoon(() => submitErrorRef.current);
        return;
      }

      if (outcome.kind === 'failed') {
        setStatus('failed');
        setSubmitError(`${outcome.message} This order was not placed.`);
        track('checkout_error', { slug, stage: 'razorpay' });
        focusSoon(() => submitErrorRef.current);
        return;
      }

      setStatus('confirming');
      const verified = await verifyRazorpayPayment(outcome);
      if (!verified.ok) {
        setStatus('failed');
        setSubmitError(verified.message);
        track('checkout_error', { slug, stage: 'razorpay_verify', status: verified.status });
        focusSoon(() => submitErrorRef.current);
        return;
      }

      clearCheckoutDraft();
      setStatus('redirecting');
      router.push(onboardingHref({
        paymentId: verified.data.paymentId,
        slug,
        templateName: template.name,
        orderId: verified.data.orderId,
        amount: verified.data.amount,
        currency: verified.data.currency || breakup.currency,
      }));
      return;
    }

    setStatus('redirecting');
    submitPayUForm(order.data.payuUrl, order.data.payuParams);
  }

  const errorList = attempted ? (Object.entries(errors) as [CheckoutField, string][]) : [];
  const payLabel = status === 'creatingOrder'
    ? 'Preparing your order…'
    : status === 'paying'
      ? 'Waiting for your payment…'
      : status === 'confirming'
        ? 'Confirming your payment…'
        : status === 'redirecting'
          ? DUMMY_PAYMENT_MODE ? 'Completing test purchase…' : 'Taking you to the payment page…'
          : DUMMY_PAYMENT_MODE
            ? `Complete test purchase · ${money(breakup.finalAmount)}`
            : `Pay ${money(breakup.finalAmount)}`;
  const describedBy = (field: CheckoutField, hint?: string) =>
    [hint, shown(field) ? `${fieldId(field)}-error` : ''].filter(Boolean).join(' ') || undefined;

  return (
    <CommerceShell label={<><span aria-hidden="true">🔒</span> Secure checkout</>}>
        <p className={styles.back}>
          <Link href={`/templates/${slug}`}>← Back to {template.name}</Link>
        </p>
        <h1 className={styles.title}>Checkout</h1>

        {DUMMY_PAYMENT_MODE && (
          <Notice tone="info" title="Test mode">
            Completing this purchase does not charge a card or open a payment page.
          </Notice>
        )}

        {paymentFailed && (
          <Notice tone="warning" title="Your payment didn’t go through" live="polite" className={styles.notice}>
            {paymentFailureMessage(failureReason)} This order was not placed.{' '}
            {draft ? 'Your details are filled in below' : 'Enter your details below'} — tick the terms again and pay when you’re ready.
            If your bank shows a payment for this attempt, contact us with the time you tried.
          </Notice>
        )}

        <div className={styles.layout}>
          {/* ── Your invitation and the price ─────────────────────────────── */}
          <aside className={styles.summary} aria-labelledby={`${id}-summary`}>
            <h2 id={`${id}-summary`} className="visually-hidden">Order summary</h2>
            <div className={styles.product}>
              <RemoteImage
                src={template.image}
                alt=""
                sizes="120px"
                aspectRatio="16 / 10"
                className={styles.thumb}
                fallback={<span className={styles.thumbFallback} aria-hidden="true">✦</span>}
              />
              <div>
                <p className={styles.productLabel}>Your invitation</p>
                <p className={styles.productName}>{template.name}</p>
              </div>
            </div>

            {trialToken && (
              <p className={styles.trialNote} role="note">
                <span aria-hidden="true">✦ </span>
                {TRY_DEMO.checkoutNote}
              </p>
            )}

            <div className={styles.included}>
              <p className={styles.sectionLabel}>Included</p>
              <ul>
                {INCLUDED_HERE.map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
                <li>{ACCESS.short}</li>
              </ul>
              <p className={ui.small}>
                Digital only — nothing is printed or posted.{' '}
                <Link href="/features" target="_blank">
                  Everything included<span className="visually-hidden"> (opens in a new tab)</span>
                </Link>
              </p>
            </div>

            <dl className={styles.price} aria-live="polite" aria-busy={!priceConfirmed || coupon.kind === 'checking'}>
              <div>
                <dt>Design price</dt>
                <dd>{money(breakup.baseAmount)}</dd>
              </div>
              {breakup.discountAmount > 0 && (
                <div className={styles.discount}>
                  <dt>
                    Discount{appliedCode ? ` (${appliedCode}` : ''}
                    {appliedCode && breakup.discountPct ? `, ${breakup.discountPct}%)` : appliedCode ? ')' : ''}
                  </dt>
                  <dd>− {money(breakup.discountAmount)}</dd>
                </div>
              )}
              {/* International orders are zero-rated exports: no GST line at all. */}
              {breakup.gstPercent > 0 && (
                <div>
                  <dt>GST ({breakup.gstPercent}%)</dt>
                  <dd>{money(breakup.gstAmount)}</dd>
                </div>
              )}
              <div className={styles.total}>
                <dt>Total to pay</dt>
                <dd>{money(breakup.finalAmount)}</dd>
              </div>
            </dl>
            <p className={ui.small}>One payment. No subscription, no renewal.</p>
          </aside>

          {/* ── Details, offers, consent, pay ────────────────────────────── */}
          <form
            className={styles.form}
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void pay();
            }}
          >
            {errorList.length > 0 && (
              <div ref={summaryRef} tabIndex={-1} role="alert" className={ui.errorSummary} aria-labelledby={`${id}-errors`}>
                <p id={`${id}-errors`} className={ui.errorSummaryTitle}>
                  {errorList.length === 1 ? 'One thing to fix before paying:' : `${errorList.length} things to fix before paying:`}
                </p>
                <ul>
                  {errorList.map(([field, message]) => (
                    <li key={field}>
                      <a
                        href={`#${fieldId(field)}`}
                        onClick={(event) => {
                          event.preventDefault();
                          document.getElementById(fieldId(field))?.focus();
                        }}
                      >
                        {message}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <section className={ui.section} aria-labelledby={`${id}-details`}>
              <h2 id={`${id}-details`} className={ui.sectionTitle}>Your details</h2>

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
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={shown('email') ? true : undefined}
                  aria-describedby={describedBy('email', `${fieldId('email')}-hint`)}
                  disabled={busy}
                />
                <p id={`${fieldId('email')}-hint`} className={ui.hint}>
                  Your receipt and the link to set up your account go here.
                </p>
                {shown('email') && (
                  <p id={`${fieldId('email')}-error`} className={ui.error}>
                    <span aria-hidden="true">⚠ </span>
                    {shown('email')}
                  </p>
                )}
              </div>

              <div className={ui.field} onBlur={() => setTouched((t) => ({ ...t, contact: true }))}>
                <label htmlFor={fieldId('contact')}>Mobile number</label>
                <PhoneField
                  id={fieldId('contact')}
                  countryCode={contactCountryCode}
                  number={contactNational}
                  placeholder={IS_INTL ? 'Phone number' : '10-digit mobile number'}
                  disabled={busy}
                  invalid={Boolean(shown('contact'))}
                  describedBy={describedBy('contact', `${fieldId('contact')}-hint`)}
                  onChange={({ countryCode, number }) => {
                    setContactCountryCode(countryCode);
                    setContactNational(number);
                  }}
                />
                <p id={`${fieldId('contact')}-hint`} className={ui.hint}>
                  For your account. It can’t be changed later without contacting support.
                </p>
                {shown('contact') && (
                  <p id={`${fieldId('contact')}-error`} className={ui.error}>
                    <span aria-hidden="true">⚠ </span>
                    {contactError(contactCountryCode, contactNational)}
                  </p>
                )}
              </div>
            </section>

            <section className={ui.section} aria-labelledby={`${id}-offers`}>
              <h2 id={`${id}-offers`} className={ui.sectionTitle}>Offers and codes</h2>

              {offers.length > 0 && (
                <ul className={styles.offers}>
                  {offers.map((offer) => {
                    const locked = !offer.eligible;
                    const applied = appliedCode === offer.code;
                    return (
                      <li key={offer.code} className={applied ? styles.offerApplied : locked ? styles.offerLocked : styles.offer}>
                        <div className={styles.offerText}>
                          <p className={styles.offerLabel}>
                            <span className={styles.offerCode}>{offer.code}</span> {offer.label}
                          </p>
                          {offer.condition && <p className={ui.small}>{offer.condition}</p>}
                          {locked && offer.unlockMessage && <p className={ui.small}>{offer.unlockMessage}</p>}
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={locked || applied || busy || coupon.kind === 'checking'}
                          onClick={() => applyCode(offer.code)}
                        >
                          {applied ? 'Applied' : locked ? 'Not yet' : `Save ${formatMoney(offer.discountAmount, offer.currency)}`}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className={ui.field}>
                <label htmlFor={`${id}-coupon`}>Have a code?</label>
                <div className={styles.couponRow}>
                  <input
                    id={`${id}-coupon`}
                    className={ui.input}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        applyCode(couponInput);
                      }
                    }}
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck={false}
                    aria-describedby={`${id}-coupon-status`}
                    disabled={busy}
                  />
                  {coupon.kind === 'applied' ? (
                    <Button variant="secondary" onClick={removeCode} disabled={busy}>Remove</Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => applyCode(couponInput)}
                      loading={coupon.kind === 'checking'}
                      disabled={busy || !couponInput.trim()}
                    >
                      Apply
                    </Button>
                  )}
                </div>
                <p id={`${id}-coupon-status`} role="status" className={coupon.kind === 'refused' || coupon.kind === 'error' ? ui.error : ui.success}>
                  {coupon.kind === 'applied' && `${coupon.code} applied${coupon.pct ? `: ${coupon.pct}% off` : ''}. New total ${money(breakup.finalAmount)}.`}
                  {coupon.kind === 'refused' && `${coupon.code}: ${coupon.message}`}
                  {coupon.kind === 'error' && `We couldn’t check ${coupon.code}. ${coupon.message}`}
                </p>
              </div>
            </section>

            <section className={ui.section} aria-labelledby={`${id}-consent`}>
              <h2 id={`${id}-consent`} className="visually-hidden">Agreement</h2>
              <div className={ui.check}>
                <input
                  id={fieldId('terms')}
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    setTouched((t) => ({ ...t, terms: true }));
                  }}
                  aria-invalid={shown('terms') ? true : undefined}
                  aria-describedby={shown('terms') ? `${fieldId('terms')}-error` : undefined}
                  disabled={busy}
                />
                <label htmlFor={fieldId('terms')}>
                  I am 18 or older and agree to the{' '}
                  <Link href="/terms" target="_blank">Terms of Service<span className="visually-hidden"> (opens in a new tab)</span></Link>{' '}
                  and{' '}
                  <Link href="/privacy" target="_blank">Privacy Policy<span className="visually-hidden"> (opens in a new tab)</span></Link>.
                </label>
              </div>
              {shown('terms') && (
                <p id={`${fieldId('terms')}-error`} className={ui.error}>
                  <span aria-hidden="true">⚠ </span>
                  {shown('terms')}
                </p>
              )}

              <div className={ui.check}>
                <input
                  id={`${id}-marketing`}
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  disabled={busy}
                />
                <label htmlFor={`${id}-marketing`}>
                  Optional: if I leave before paying, email me one link to pick up where I left off.
                </label>
              </div>
            </section>

            <Notice tone="info" className={styles.notice}>
              <strong>{SELF_BUILD.checkoutNote}</strong> {SELF_BUILD.short}
            </Notice>

            {submitError && (
              <div ref={submitErrorRef} tabIndex={-1} role="alert" className={ui.submitError}>
                <p className={ui.errorSummaryTitle}>We couldn’t start the payment</p>
                <p>{submitError}</p>
                <p className={ui.small}>Nothing was charged. Check your details and try again.</p>
              </div>
            )}

            <button type="submit" className={ui.pay} disabled={busy} aria-busy={busy || undefined}>
              {busy && <span className={ui.spinner} aria-hidden="true" />}
              {payLabel}
            </button>

            <p className={styles.reassure}>
              {IS_INTL ? 'Payments are processed securely by our payment partner.' : 'Pay with UPI, cards or net banking, processed securely by our payment partner.'}
            </p>
          </form>
        </div>
    </CommerceShell>
  );
}
