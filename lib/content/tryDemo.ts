/**
 * "Try it with your names": the copy and the terms it states.
 *
 * The two numbers mirror the backend defaults (TRIAL_DEMO_LINK_MINUTES and
 * TRIAL_DEMO_DATA_HOURS). The sheet itself shows the link lifetime the API
 * reports, so only static text — the FAQ — relies on these values.
 *
 * Buying from a demo carries its details into the new invitation (checkout
 * sends the token; registration fills in the couple, venue and ceremonies),
 * for as long as the details are kept.
 */
export const TRY_DEMO = {
  linkMinutes: 15,
  dataHours: 24,
  cta: 'Try it with your names',
  ctaShort: 'Try free',
  bandTitle: 'See it with your names in about a minute',
  bandText:
    'Enter the two names, your wedding date, the venue and the ceremonies, and see this design filled in with them. Free, with no account and no email address.',
  watermarkNote: 'The preview is watermarked, and RSVPs and wishes on it don’t send anything.',
  buyWithDetails: 'Buy this design, keep these details',
  buyNote: 'After you pay and create your account, your invitation starts with these names, dates, venue and ceremonies. You can change any of them before you confirm the names.',
  checkoutNote:
    'Details from your demo — the names, wedding date, venue and ceremonies — will be added to your new invitation if you buy within a day of making the demo. You can change them in the builder.',
  onboardingNote:
    'We’ve added the names, wedding date, venue and ceremonies from your demo. Check them in step 1 of the builder before you confirm the names.',
} as const;

/** Shown under the form, before anything is sent. */
export function tryDemoPrivacyNote(linkMinutes: number): string {
  return `We use these details only to show your preview. The link works for ${linkMinutes} minutes, and anyone you send it to can see the names on it. Everything you type is deleted about a day later, unless you buy this design and it becomes part of your invitation.`;
}
