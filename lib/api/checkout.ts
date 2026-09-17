import { apiRequest, type ApiResult } from './client';
import { isRecord } from './parse';
import { storefrontHeaders } from '../storefront';
import type {
  CouponPreview,
  CouponPreviewRequest,
  DummyOrderResponse,
  OfferCoupon,
  OrderRequest,
  OrderResponse,
  PaymentStatus,
} from './types';

/**
 * Browser-side checkout calls. Pricing requests carry the storefront header so
 * the server prices and taxes them the way this deployment shows them; the
 * server's figures always win over anything computed on the page.
 */

/** Mirrors the backend's check in GET /api/checkout/payment-status/:paymentId. */
const PAYMENT_ID_RE = /^[0-9a-f-]{36}$/i;

/** Offers to show for a template. Never an error: no offers is an ordinary answer. */
export async function getOffers(templateSlug: string, customerEmail?: string, signal?: AbortSignal): Promise<OfferCoupon[]> {
  if (!templateSlug) return [];
  const result = await apiRequest<unknown>('GET', '/api/checkout/coupons', {
    query: { templateSlug, customerEmail: customerEmail?.trim() || undefined },
    headers: storefrontHeaders(),
    signal,
  });
  if (!result.ok || !isRecord(result.data) || !Array.isArray(result.data.coupons)) return [];
  return result.data.coupons.filter(
    (c): c is OfferCoupon => isRecord(c) && typeof c.code === 'string' && c.code !== '',
  );
}

export function previewCoupon(input: CouponPreviewRequest, signal?: AbortSignal): Promise<ApiResult<CouponPreview>> {
  return apiRequest<CouponPreview>('POST', '/api/checkout/coupon-preview', {
    body: input,
    headers: storefrontHeaders(),
    signal,
  });
}

/** Creates the pending payment. Call once per Pay press. */
export function createOrder(input: OrderRequest): Promise<ApiResult<OrderResponse>> {
  return apiRequest<OrderResponse>('POST', '/api/checkout/order', {
    body: input,
    headers: storefrontHeaders(),
  });
}

export function isDummyOrder(order: OrderResponse): order is DummyOrderResponse {
  return 'dummy' in order && order.dummy === true;
}

/** Where a payment stands, for onboarding. A 404 means the id is unknown. */
export async function getPaymentStatus(paymentId: string, signal?: AbortSignal): Promise<ApiResult<PaymentStatus>> {
  if (!PAYMENT_ID_RE.test(paymentId)) {
    return { ok: false, status: 400, message: 'Invalid payment id' };
  }
  return apiRequest<PaymentStatus>('GET', `/api/checkout/payment-status/${encodeURIComponent(paymentId)}`, { signal });
}
