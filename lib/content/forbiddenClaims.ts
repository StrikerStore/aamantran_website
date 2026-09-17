/**
 * Claims the storefront must not make, because the product contradicts them.
 * `npm run check:claims` (scripts/check-claims.mjs) scans the site's source for
 * these patterns.
 *
 * Kept free of imports so the check script can load it directly under Node.
 *
 * A deliberate, negated mention ("guests can't upload") usually does not match.
 * When one does, put `claims-ok` in a comment on that line or the line above,
 * with the reason.
 */
export interface ForbiddenClaim {
  id: string;
  pattern: RegExp;
  /** What the product actually does. */
  why: string;
}

export const CLAIMS_OK_MARKER = 'claims-ok';

export const FORBIDDEN_CLAIMS: readonly ForbiddenClaim[] = [
  {
    id: 'lifetime-access',
    pattern: /\blifetime (access|validity|hosting)\b|\b(live|access|hosted|stays?) forever\b|\bnever expires?\b/i,
    why: 'Invitations stay live until 6 months after the last ceremony.',
  },
  {
    id: 'vague-access',
    pattern: /\bduration of your plan\b/i,
    why: 'There are no plans; state the real term: 6 months after the last ceremony.',
  },
  {
    id: 'edit-anything',
    pattern: /\bedit any detail\b|\bedit (anything|everything)\b|\bchange anything\b/i,
    why: 'Names lock once confirmed at builder step 1; corrections go through support.',
  },
  {
    id: 'done-for-you',
    pattern: /\bwe set it up\b|\bset it up for you\b|\bdone[- ]for[- ]you\b|\bwe(['’]ll| will)? personali[sz]e\b|\bwe (will )?(create|created|design|designed|build|built) (it|the invitation|your invitation)\b/i,
    why: 'Customers build the invitation themselves in the dashboard.',
  },
  {
    id: 'same-day-setup',
    pattern: /\bsame[- ]day (setups?|turnaround|delivery)\b/i,
    why: 'There is no setup service; customers publish their own invitation.',
  },
  {
    id: 'setup-time',
    pattern: /\b(setup|set up|live|ready|done|invite your guests)\b[^.\n]{0,40}\b(in|within|under) (an hour|\d+ (minutes|mins|hours|hrs))\b|\bavg\. setup time\b/i,
    why: 'Quote setup time only from SETUP_TIME in lib/content/claims.ts.',
  },
  {
    id: 'custom-fonts-colours',
    pattern: /\bcustom (fonts?|colou?rs?)\b|\b(choose|pick|change) (the |your own |any )?(fonts?|colou?rs?)\b/i,
    why: "A design's layout, fonts and colours are fixed.",
  },
  {
    id: 'bulk-whatsapp',
    pattern: /\bbulk (whatsapp|sms|messag)|\bwhatsapp broadcast\b|\bsend to all (your )?guests at once\b/i,
    why: 'Sharing opens WhatsApp with one ready message; nothing is sent in bulk.',
  },
  {
    id: 'per-guest-links',
    pattern: /\b(unique|personali[sz]ed|individual) (rsvp )?links? (for|per|to) (each|every) guest\b|\bper-guest links?\b|\blinks? per guest\b/i,
    why: 'Every guest opens the same invitation link (or the paired partial link).',
  },
  {
    id: 'file-download',
    pattern: /\bdownload(able)?\b[^.\n]{0,30}\b(pdf|mp4|video)\b|\b(pdf|mp4) (download|version|copy)\b/i,
    why: 'Invitations are web links; there is no PDF or video export.',
  },
  {
    id: 'guest-uploads',
    pattern: /\bguests? (can |could )?upload\b|\bguest (photo )?uploads?\b/i,
    why: "The photo wall is the couple's private album; guests cannot upload.",
  },
  {
    id: 'auto-translate',
    pattern: /\bauto[- ]?translat|\bautomatic(ally)? translat|\btranslat(es|ed) (it |your invitation )?automatically\b/i,
    why: "Text appears as typed; a design's languages are fixed and nothing is translated.",
  },
  {
    id: 'collaborative-planning',
    pattern: /\bcollaborat|\b(invite|add) (your )?(family|partner|planner)s? to (edit|plan|manage)\b|\bshared (dashboard|access|workspace)\b/i,
    why: 'Planning tools belong to one account; there are no shared editors.',
  },
];
