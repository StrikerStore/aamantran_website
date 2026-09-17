/**
 * The invitation builder, as a buyer should picture it.
 *
 * MIRRORS SECTIONS in aamantran_user/src/pages/GenerateInvitation.jsx: same
 * ids, same labels, same order. When a builder step is added, renamed or
 * reordered there, update it here.
 */

export interface BuilderStep {
  id: string;
  label: string;
  /** What the customer enters at this step. */
  youEnter: string;
}

export const BUILDER_STEPS: readonly BuilderStep[] = [
  { id: 'people', label: 'People & Names', youEnter: 'The names on your invitation. You confirm them at the end of this step, and they lock after that.' },
  { id: 'venues', label: 'Venues', youEnter: "Each venue's name and address. Paste a Google Maps link and the location fills in." },
  { id: 'functions', label: 'Ceremonies', youEnter: "Each ceremony's date, time, venue, dress code and notes." },
  { id: 'media', label: 'Photos & Music', youEnter: 'Photos, video and background music for the spaces your design has.' },
  { id: 'custom', label: 'Special Details', youEnter: 'Anything else your design asks for, such as your story or a contact person.' },
  { id: 'social', label: 'Guest Options', youEnter: 'Instagram and YouTube links, and whether RSVP and wishes are shown.' },
  { id: 'language', label: 'Language', youEnter: "Which of your design's languages the invitation uses." },
  { id: 'publish', label: 'Preview & Publish', youEnter: 'Check a private preview, choose your link, add an optional second link for selected ceremonies, and publish.' },
];

/** How the builder behaves, in one line each. */
export const BUILDER_RULES: readonly string[] = [
  'Next saves each step and opens the one after it.',
  'Names lock once you confirm them at the first step.',
  'You can preview privately before publishing.',
  'Sharing opens once your invitation is published.',
];

export interface PurchaseStep {
  id: string;
  title: string;
  text: string;
}

/** From first visit to RSVPs, for "How it works". The customer builds at step 4. */
export const PURCHASE_STEPS: readonly PurchaseStep[] = [
  { id: 'choose', title: 'Choose your design', text: 'Browse the invitations and open any live demo to see it the way your guests will.' },
  { id: 'pay', title: 'Pay once', text: 'One payment, no subscription. You see the full total before you pay.' },
  { id: 'account', title: 'Create your account', text: 'Set up your dashboard login straight after payment.' },
  { id: 'build', title: 'Build it yourself', text: 'Add your names, venues, ceremonies, photos and music in the guided builder.' },
  { id: 'publish', title: 'Preview and publish', text: 'Check the private preview, then publish your link.' },
  { id: 'share', title: 'Share and track', text: 'Send it on WhatsApp and watch RSVPs arrive in your dashboard.' },
];
