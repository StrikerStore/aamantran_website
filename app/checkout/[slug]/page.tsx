'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { getPublicApiUrl } from '@/lib/publicEnv';

const API = getPublicApiUrl();
const DUMMY_PAYMENT_MODE = String(process.env.NEXT_PUBLIC_DUMMY_PAYMENT_MODE || '').toLowerCase() === 'true';

interface TemplateData {
  id: string;
  slug: string;
  name: string;
  community: string;
  price: number;
  originalPrice: number | null;
  gstPercent?: number;
  thumbnailUrl: string | null;
}

interface PriceBreakup {
  baseAmount: number;
  discountAmount: number;
  discountPct: number;
  discountedAmount: number;
  gstPercent: number;
  gstAmount: number;
  finalAmount: number;
}

function rupees(paise: number) {
  return (paise / 100).toLocaleString('en-IN');
}

function defaultBreakup(template: TemplateData): PriceBreakup {
  const baseAmount = template.price;
  const discountAmount = 0;
  const discountPct = 0;
  const discountedAmount = Math.max(100, baseAmount - discountAmount);
  const gstPercent = Number(template.gstPercent || 0);
  const gstAmount = Math.round((discountedAmount * gstPercent) / 100);
  const finalAmount = discountedAmount + gstAmount;
  return { baseAmount, discountAmount, discountPct, discountedAmount, gstPercent, gstAmount, finalAmount };
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

export default function CheckoutPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;

  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [couponMsg, setCouponMsg] = useState('');
  const [breakup, setBreakup] = useState<PriceBreakup | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());
  const contactDigits = customerContact.replace(/\D/g, '');
  const contactValid = /^[6-9]\d{9}$/.test(contactDigits);
  const canPay = emailValid && contactValid && !paying;

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/api/templates/${slug}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        setTemplate(data);
        if (data) {
          const bp = defaultBreakup(data);
          setBreakup(bp);
          if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'InitiateCheckout', {
              value: bp.finalAmount / 100,
              currency: 'INR',
              content_ids: [slug],
              content_name: data.name,
              content_type: 'product',
            });
          }
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setAppliedCoupon('');
      setCouponMsg('');
      if (template) setBreakup(defaultBreakup(template));
      return;
    }
    fetch(`${API}/api/checkout/coupon-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      alert('Please enter a valid email and 10-digit mobile number.');
      return;
    }
    setPaying(true);
    try {
      const orderRes = await fetch(`${API}/api/checkout/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateSlug:    slug,
          couponCode:      appliedCoupon || undefined,
          customerEmail:   customerEmail.trim(),
          customerContact: contactDigits,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData?.message || 'Unable to start checkout');

      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Purchase', {
          value: (breakup?.finalAmount ?? 0) / 100,
          currency: 'INR',
          content_ids: [slug],
          content_name: template.name,
          content_type: 'product',
        });
      }

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
        router.push(`/onboarding?paymentId=${encodeURIComponent(orderData.paymentId)}&slug=${encodeURIComponent(slug)}&template=${encodeURIComponent(template.name)}`);
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
        <p className="checkout-sub">Secure payment for your invitation template</p>

        <div className="checkout-contact-row">
          <input
            type="email"
            placeholder="Enter email"
            value={customerEmail}
            onChange={e => setCustomerEmail(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Enter contact number"
            value={customerContact}
            onChange={e => setCustomerContact(e.target.value)}
          />
        </div>
        {customerEmail && !emailValid && <p className="checkout-error-msg">Please enter a valid email address.</p>}
        {customerContact && !contactValid && <p className="checkout-error-msg">Please enter a valid 10-digit Indian mobile number.</p>}

        <div className="checkout-product">
          <div>
            <p className="checkout-label">Product</p>
            <p className="checkout-name">{template.name}</p>
          </div>
        </div>

        <div className="checkout-breakup">
          <div><span>Template price</span><strong>INR {rupees(breakup?.baseAmount || 0)}</strong></div>
          <div><span>Discount{breakup?.discountPct ? ` (${breakup.discountPct}%)` : ''}</span><strong>- INR {rupees(breakup?.discountAmount || 0)}</strong></div>
          <div><span>GST ({breakup?.gstPercent || 0}%)</span><strong>INR {rupees(breakup?.gstAmount || 0)}</strong></div>
          <div className="total"><span>Total payable</span><strong>INR {rupees(breakup?.finalAmount || 0)}</strong></div>
        </div>

        <div className="checkout-coupon">
          <input
            type="text"
            placeholder="Coupon code"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value)}
          />
          <button type="button" onClick={applyCoupon}>Apply</button>
        </div>
        {couponMsg && <p className="checkout-coupon-msg">{couponMsg}</p>}

        <button className="checkout-pay-btn" type="button" onClick={handlePayNow} disabled={!canPay}>
          {paying ? 'Redirecting to PayU…' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
}
