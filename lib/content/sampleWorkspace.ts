import type { Storefront } from '../storefront';

/**
 * Made-up planning data for the homepage planning demo. It lives only in the
 * visitor's browser, and nothing is saved.
 *
 * Amounts are whole units of the storefront currency (rupees or dollars), set
 * per storefront so a dollar visitor never sees a rupee-sized budget.
 */

export const SAMPLE_WORKSPACE_NOTICE = 'Sample data. Nothing is saved.';

type PerStorefront = Record<Storefront, number>;

export const SAMPLE_BUDGET_TOTAL: PerStorefront = { IN: 1500000, INTL: 25000 };

export interface SampleExpense {
  id: string;
  label: string;
  category: string;
  amount: PerStorefront;
  paid: boolean;
}

export const SAMPLE_EXPENSES: readonly SampleExpense[] = [
  { id: 'venue', label: 'Wedding venue', category: 'Venue', amount: { IN: 450000, INTL: 7500 }, paid: true },
  { id: 'catering', label: 'Catering, three ceremonies', category: 'Food', amount: { IN: 380000, INTL: 6200 }, paid: false },
  { id: 'decor', label: 'Flowers and decor', category: 'Decor', amount: { IN: 150000, INTL: 2500 }, paid: true },
  { id: 'photos', label: 'Photographer', category: 'Photography', amount: { IN: 120000, INTL: 2000 }, paid: false },
  { id: 'outfits', label: 'Outfits', category: 'Clothing', amount: { IN: 200000, INTL: 3300 }, paid: true },
  { id: 'music', label: 'DJ for the sangeet', category: 'Entertainment', amount: { IN: 60000, INTL: 1000 }, paid: false },
];

export type SampleTaskStatus = 'todo' | 'in_progress' | 'done';

export interface SampleTask {
  id: string;
  title: string;
  category: string;
  owner: 'Bride' | 'Groom' | 'Family' | 'Vendor';
  status: SampleTaskStatus;
}

export const SAMPLE_TASKS: readonly SampleTask[] = [
  { id: 'book-venue', title: 'Book the venue', category: 'Venue', owner: 'Family', status: 'done' },
  { id: 'guest-list', title: 'Finalise the guest list', category: 'Guests', owner: 'Bride', status: 'in_progress' },
  { id: 'menu', title: 'Taste-test the menu', category: 'Food', owner: 'Groom', status: 'todo' },
  { id: 'mehendi-artist', title: 'Confirm the mehendi artist', category: 'Vendors', owner: 'Family', status: 'todo' },
];

export interface SampleVendor {
  id: string;
  type: string;
  name: string;
  status: 'Enquired' | 'Negotiating' | 'Booked';
}

export const SAMPLE_VENDORS: readonly SampleVendor[] = [
  { id: 'photographer', type: 'Photographer', name: 'Sample photography studio', status: 'Booked' },
  { id: 'caterer', type: 'Caterer', name: 'Sample caterers', status: 'Negotiating' },
  { id: 'decorator', type: 'Decorator', name: 'Sample decor company', status: 'Booked' },
  { id: 'dj', type: 'DJ', name: 'Sample DJ', status: 'Enquired' },
];

export interface SampleTimelineEntry {
  id: string;
  time: string;
  title: string;
  who: string;
}

/** The sample wedding day. */
export const SAMPLE_TIMELINE: readonly SampleTimelineEntry[] = [
  { id: 'baraat', time: '4:00 PM', title: 'Baraat gathers', who: "Groom's family" },
  { id: 'arrivals', time: '6:30 PM', title: 'Guests arrive', who: 'Welcome team' },
  { id: 'varmala', time: '7:00 PM', title: 'Varmala', who: 'Couple' },
  { id: 'pheras', time: '8:30 PM', title: 'Pheras', who: 'Pandit ji' },
  { id: 'dinner', time: '10:00 PM', title: 'Dinner', who: 'Caterer' },
];

export const SAMPLE_TASK_STATUS_ORDER: readonly SampleTaskStatus[] = ['todo', 'in_progress', 'done'];
