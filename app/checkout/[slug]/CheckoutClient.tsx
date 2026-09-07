'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { getPublicApiUrl } from '@/lib/publicEnv';
import { track } from '@/lib/track';
import { CURRENCY, IS_INTL, formatMoney, priceFor, storefrontHeaders } from '@/lib/storefront';
import PhoneField from '@/components/PhoneField';

const API = getPublicApiUrl();
const DUMMY_PAYMENT_MODE = String(process.env.NEXT_PUBLIC_DUMMY_PAYMENT_MODE || '').toLowerCase() === 'true';

interface TemplateData {
  id: string;
  slug: string;
  name: string;
  community: string;
  price: number;
  originalPrice: number | null;
  // Derived server-side from the INR price. Both ship together because this
  // response feeds statically cached pages too.
  priceUsd: number | null;
  originalPriceUsd: number | null;
  gstPercent?: number;
  thumbnailUrl: string | null;
}

interface OfferCoupon {
  code: string;
  discountPercent: number;
  discountAmount: number;
  label: string;
  condition: string;
  expiresAt: string | null;
  eligible: boolean;
  /** The storefront this offer belongs to — 'INR' or 'USD'. */
  currency: string;
  /** Why this offer cannot be used yet, e.g. "Add ₹1,999 more to unlock this offer". */
  unlockMessage: string | null;
}

interface PriceBreakup {
  baseAmount: number;
  discountAmount: number;
  discountPct: number;
  discountedAmount: number;
  gstPercent: number;
  gstAmount: number;
  finalAmount: number;
  /** Every amount above is in the minor unit of this currency. */
  currency: string;
}

/**
 * The opening figures, before the server has said anything.
 *
 * A first paint only — every later breakup comes from /coupon-preview or
 * /order, which recompute it server-side for the storefront this deployment
 * declares. If this guess and the server ever disagree, the server wins and the
 * customer is charged what it says.
 *
 * International orders are zero-rated, so GST is dropped along with the switch
 * to dollars rather than being a separate rule the page has to remember.
 */
function defaultBreakup(template: TemplateData): PriceBreakup {
  const intl = IS_INTL && template.priceUsd != null;
  const baseAmount = priceFor(template) ?? template.price;
  const discountAmount = 0;
  const discountPct = 0;
  const discountedAmount = Math.max(100, baseAmount - discountAmount);
  const gstPercent = intl ? 0 : Number(template.gstPercent || 0);
  const gstAmount = Math.round((discountedAmount * gstPercent) / 100);
  const finalAmount = discountedAmount + gstAmount;
  return {
    baseAmount, discountAmount, discountPct, discountedAmount,
    gstPercent, gstAmount, finalAmount,
    currency: intl ? 'USD' : 'INR',
  };
}

/** Submit a hidden form to PayU's payment URL */
function submitPayUForm(payuUrl: string, params: Record<string, string>) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = payuUrl;
  Object.entries(params).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value ?? '');
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutClient() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;

  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  // Split, because that is how the number is stored and how PayU is given it.
  const [contactCountryCode, setContactCountryCode] = useState(IS_INTL ? '+1' : '+91');
  const [contactNational, setContactNational] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [couponMsg, setCouponMsg] = useState('');
  const [breakup, setBreakup] = useState<PriceBreakup | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [offers, setOffers] = useState<OfferCoupon[]>([]);

  // Which storefront this build IS. The server still recomputes every amount
  // from the storefront header these requests carry, so the figures coming back
  // from /coupon-preview and /order remain the truth.

  /** Amounts in whatever currency the current breakup is quoted in. */
  const money = (minor: number) => formatMoney(minor, breakup?.currency || CURRENCY);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());
  const contactDigits = contactNational.replace(/\D/g, '');
  // E.164 caps the whole number, dial code included, at 15 digits.
  const e164Digits = contactCountryCode.replace(/\D/g, '') + contactDigits;
  // The 10-digit [6-9] rule describes Indian mobile numbers and rejects every
  // valid foreign one, so it is applied only to the India storefront.
  // Internationally the bar is E.164's own limits.
  const contactValid = contactCountryCode === '+91'
    // Every Indian mobile is ten digits starting 6-9. Kept as a specific check
    // because it is still the overwhelming majority of traffic.
    ? /^[6-9]\d{9}$/.test(contactDigits)
    : e164Digits.length >= 8 && e164Digits.length <= 15;
  const canPay = emailValid && contactValid && agreeTerms && !paying;

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/api/templates/${slug}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        setTemplate(data);
        if (data) {
          const bp = defaultBreakup(data);
          setBreakup(bp);
          track('initiate_checkout', { slug, value: bp.finalAmount / 100, currency: bp.currency });
          if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'InitiateCheckout', {
              value: bp.finalAmount / 100,
              currency: bp.currency,
              content_ids: [slug],
              content_name: data.name,
              content_type: 'product',
            });
          }
        }
      })
      .finally(() => setLoading(false));
    // Runs once per slug. The storefront is a build-time constant now, so there
    // is nothing else for this to depend on and InitiateCheckout fires once.
  }, [slug]);

  // Offers are advisory: the authoritative price always comes from
  // /coupon-preview when a code is applied, so a failure here is silent.
  useEffect(() => {
    if (!slug) return;
    const email = emailValid ? customerEmail.trim() : '';
    const controller = new AbortController();

    // Debounced because this re-runs while the customer is still typing.
    const timer = setTimeout(() => {
      const qs = new URLSearchParams({ templateSlug: String(slug) });
      if (email) qs.set('customerEmail', email);
      fetch(`${API}/api/checkout/coupons?${qs.toString()}`, { signal: controller.signal, headers: storefrontHeaders() })
        .then(r => (r.ok ? r.json() : null))
        .then(d => setOffers(Array.isArray(d?.coupons) ? d.coupons : []))
        .catch(() => { /* offers are optional; the code input still works */ });
    }, email ? 400 : 0);

    return () => { clearTimeout(timer); controller.abort(); };
  }, [slug, emailValid, customerEmail]);

  function applyOffer(code: string) {
    setCouponCode(code);
    applyCoupon(code);
  }

  function applyCoupon(overrideCode?: string) {
    // Only trust a real string: passing this as a bare event handler would
    // otherwise hand us a MouseEvent.
    const raw = typeof overrideCode === 'string' ? overrideCode : couponCode;
    const code = raw.trim().toUpperCase();
    if (!code) {
      setAppliedCoupon('');
      setCouponMsg('');
      if (template) setBreakup(defaultBreakup(template));
      return;
    }
    fetch(`${API}/api/checkout/coupon-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...storefrontHeaders() },
      body: JSON.stringify({ templateSlug: slug, couponCode: code, customerEmail }),
    })
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d?.message || 'Failed to apply coupon');
        if (d.valid) {
          setAppliedCoupon(code);
          setCouponMsg(`Coupon applied: ${d.priceBreakup.discountPct}% off`);
          setBreakup({
            ...d.priceBreakup,
            discountedAmount: Math.max(100, Number(d.priceBreakup.baseAmount) - Number(d.priceBreakup.discountAmount)),
          });
        } else {
          setAppliedCoupon('');
          setCouponMsg(d.reason || 'Invalid or inactive coupon code');
          if (d.priceBreakup) {
            setBreakup({
              ...d.priceBreakup,
              discountedAmount: Math.max(100, Number(d.priceBreakup.baseAmount) - Number(d.priceBreakup.discountAmount)),
            });
          } else if (template) {
            setBreakup(defaultBreakup(template));
          }
        }
      })
      .catch((err) => {
        setAppliedCoupon('');
        setCouponMsg(err.message || 'Could not verify coupon');
        if (template) setBreakup(defaultBreakup(template));
      });
  }

  async function handlePayNow() {
    if (!template || !slug || paying) return;
    if (!emailValid || !contactValid) {
      alert(IS_INTL
        ? 'Please enter a valid email and contact number.'
        : 'Please enter a valid email and 10-digit mobile number.');
      return;
    }
    if (!agreeTerms) {
      alert('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }
    setPaying(true);
    try {
      const orderRes = await fetch(`${API}/api/checkout/order`, {
        method: 'POST',
        // The server cross-checks this against Origin before deciding what to
        // charge, so it cannot be used to claim the other site's pricing.
        headers: { 'Content-Type': 'application/json', ...storefrontHeaders() },
        body: JSON.stringify({
          templateSlug:    slug,
          couponCode:      appliedCoupon || undefined,
          customerEmail:   customerEmail.trim(),
          customerContact: contactNational,
          customerContactCountryCode: contactCountryCode,
          consent:         agreeTerms,
          marketingOptIn,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData?.message || 'Unable to start checkout');

      // NOTE: the Meta `Purchase` event is deliberately NOT fired here — at this
      // point the order only exists as `pending` and the visitor has not paid yet.
      // It fires on /onboarding, which PayU only reaches after a verified payment.

      if (DUMMY_PAYMENT_MODE) {
        const mockRes = await fetch(`${API}/api/checkout/mock-success`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: orderData.paymentId }),
        });
        if (!mockRes.ok) {
          const mockData = await mockRes.json().catch(() => ({}));
          throw new Error(mockData?.message || 'Mock payment failed');
        }
        router.push(`/onboarding?paymentId=${encodeURIComponent(orderData.paymentId)}&slug=${encodeURIComponent(slug)}&template=${encodeURIComponent(template.name)}&amount=${breakup?.finalAmount ?? 0}`);
        return;
      }

      // Submit form to PayU — browser navigates away; PayU will redirect back to surl/furl
      submitPayUForm(orderData.payuUrl, orderData.payuParams);
    } catch (err: any) {
      alert(err?.message || 'Checkout failed');
      setPaying(false);
    }
    // Note: setPaying(false) is intentionally NOT called on success path
    // because the page navigates away to PayU
  }

  if (loading) return <div className="checkout-wrap">Loading checkout…</div>;
  if (!template) return <div className="checkout-wrap">Template not found.</div>;

  return (
    <div className="checkout-wrap">
      <div className="checkout-card">
        <Link href="/" className="checkout-brand">
          <Image src="/logo.png" alt="" width={40} height={40} className="checkout-brand-logo" />
          <span className="checkout-brand-name">Aamantran</span>
        </Link>
        <h1>Checkout</h1>
        <p className="checkout-sub">
          {DUMMY_PAYMENT_MODE
            ? 'Test mode — completing purchase does not charge a card or open PayU.'
            : 'Secure payment for your invitation template'}
        </p>

        <div className="checkout-contact-row">
          <input
            type="email"
            placeholder="Enter email"
            value={customerEmail}
            onChange={e => setCustomerEmail(e.target.value)}
          />
          <PhoneField
            countryCode={contactCountryCode}
            number={contactNational}
            placeholder="Enter contact number"
            onChange={({ countryCode, number }) => {
              setContactCountryCode(countryCode);
              setContactNational(number);
            }}
          />
        </div>
        {customerEmail && !emailValid && <p className="checkout-error-msg">Please enter a valid email address.</p>}
        {contactNational && !contactValid && (
          <p className="checkout-error-msg">
            {contactCountryCode === '+91'
              ? 'Please enter a valid 10-digit Indian mobile number.'
              : 'Please enter a valid contact number for the country code selected.'}
          </p>
        )}

        <div className="checkout-product">
          <div>
            <p className="checkout-label">Product</p>
            <p className="checkout-name">{template.name}</p>
          </div>
        </div>

        <div className="checkout-breakup">
          <div><span>Template price</span><strong>{money(breakup?.baseAmount || 0)}</strong></div>
          <div><span>Discount{breakup?.discountPct ? ` (${breakup.discountPct}%)` : ''}</span><strong>- {money(breakup?.discountAmount || 0)}</strong></div>
          {/* Hidden rather than shown as 0%: international orders are zero-rated
              exports, so a GST line has no meaning on them at all. */}
          {(breakup?.gstPercent || 0) > 0 && (
            <div><span>GST ({breakup?.gstPercent}%)</span><strong>{money(breakup?.gstAmount || 0)}</strong></div>
          )}
          <div className="total"><span>Total payable</span><strong>{money(breakup?.finalAmount || 0)}</strong></div>
        </div>

        <div className="checkout-coupon">
          <input
            type="text"
            placeholder="Coupon code"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value)}
          />
          <button type="button" onClick={() => applyCoupon()}>Apply</button>
        </div>
        {couponMsg && <p className="checkout-coupon-msg">{couponMsg}</p>}

        {offers.length > 0 && (
          <div className="checkout-offers">
            <p className="checkout-offers-title">Offers</p>
            <div className="checkout-offers-list">
              {offers.map(o => {
                const locked = !o.eligible;
                const applied = !locked && appliedCoupon === o.code;
                return (
                  <div
                    key={o.code}
                    className={`checkout-offer${applied ? ' is-applied' : ''}${locked ? ' is-locked' : ''}`}
                  >
                    <div className="checkout-offer-main">
                      <span className="checkout-offer-code">{o.code}</span>
                      <span className="checkout-offer-label">{o.label}</span>
                    </div>
                    {o.condition && <p className="checkout-offer-cond">{o.condition}</p>}
                    {locked && o.unlockMessage && <p className="checkout-offer-unlock">{o.unlockMessage}</p>}
                    <button
                      type="button"
                      className="checkout-offer-btn"
                      disabled={locked || applied}
                      onClick={() => applyOffer(o.code)}
                    >
                      {locked ? 'Locked' : applied ? 'Applied' : `Save ${formatMoney(o.discountAmount, o.currency)}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, display: 'grid', gap: 8, fontSize: '0.82rem', color: 'var(--text-subtle, #8a7a6f)', textAlign: 'left' }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={e => setAgreeTerms(e.target.checked)}
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <span>
              I am 18 or older and agree to the{' '}
              <Link href="/terms" target="_blank" style={{ textDecoration: 'underline', color: 'inherit' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" target="_blank" style={{ textDecoration: 'underline', color: 'inherit' }}>Privacy Policy</Link>.
            </span>
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={e => setMarketingOptIn(e.target.checked)}
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <span>If I step away before finishing, email me a one-time link so I can pick up where I left off. (optional)</span>
          </label>
        </div>

        <button className="checkout-pay-btn" type="button" onClick={handlePayNow} disabled={!canPay}>
          {paying
            ? DUMMY_PAYMENT_MODE
              ? 'Completing test purchase…'
              : 'Redirecting to PayU…'
            : DUMMY_PAYMENT_MODE
              ? 'Complete purchase (test — no payment)'
              : 'Pay Now'}
        </button>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 14px', marginTop: 14, fontSize: '0.76rem', color: 'var(--text-subtle, #8a7a6f)' }}>
          <span>🔒 Secure payment via PayU</span>
          <span>·</span>
          <Link href="/refund" style={{ color: 'inherit', textDecoration: 'underline' }}>Refund policy</Link>
          <span>·</span>
          <span>Trusted by 500+ couples</span>
        </div>
      </div>
    </div>
  );
}
