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

declare global {
  interface Window {
    Razorpay: any;
  }
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
        if (data) setBreakup(defaultBreakup(data));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
        body: JSON.stringify({ templateSlug: slug, couponCode: appliedCoupon || undefined, customerEmail: customerEmail.trim() }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData?.message || 'Unable to start checkout');

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

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Aamantran',
        description: `Template purchase: ${template.name}`,
        order_id: orderData.orderId,
        prefill: { email: customerEmail.trim(), contact: contactDigits },
        handler: async function (response: any) {
          const verifyRes = await fetch(`${API}/api/checkout/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: orderData.paymentId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (!verifyRes.ok) {
            alert('Payment verification failed. Please contact support.');
            return;
          }

          router.push(`/onboarding?paymentId=${encodeURIComponent(orderData.paymentId)}&slug=${encodeURIComponent(slug)}&template=${encodeURIComponent(template.name)}`);
        },
        theme: { color: '#6e1f2e' },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert('Razorpay failed to load. Please refresh and try again.');
      }
    } catch (err: any) {
      alert(err?.message || 'Checkout failed');
    } finally {
      setPaying(false);
    }
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
          {paying ? 'Processing…' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
}
