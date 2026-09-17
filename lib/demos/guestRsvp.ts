/**
 * The RSVP a guest fills in, as a pure state machine.
 *
 * Used by the homepage demo, where nothing is sent anywhere: the same rules a
 * real invitation applies (you cannot reply without a name, or without saying
 * which ceremonies you are coming to, and a reply cannot be edited once it is
 * in) are enforced here so the demo behaves like the real thing rather than
 * merely looking like it.
 *
 * Kept free of imports so it can be tested directly under Node.
 */

export const MAX_EXTRA_GUESTS = 4;
export const MAX_NAME_LENGTH = 60;
export const MAX_MESSAGE_LENGTH = 240;

export interface RsvpState {
  name: string;
  /** Ceremony ids the guest says they will attend. */
  attending: string[];
  /** People coming in addition to the guest. */
  extraGuests: number;
  meal: string;
  message: string;
  submitted: boolean;
}

export type RsvpAction =
  | { type: 'name'; value: string }
  | { type: 'toggle-ceremony'; id: string }
  | { type: 'extra-guests'; value: number }
  | { type: 'meal'; value: string }
  | { type: 'message'; value: string }
  | { type: 'submit' }
  | { type: 'reset' };

export function initialRsvpState(): RsvpState {
  return { name: '', attending: [], extraGuests: 0, meal: '', message: '', submitted: false };
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function rsvpReducer(state: RsvpState, action: RsvpAction): RsvpState {
  // A reply that has been sent is read-only, exactly as on a real invitation.
  if (state.submitted && action.type !== 'reset') return state;

  switch (action.type) {
    case 'name':
      return { ...state, name: action.value.slice(0, MAX_NAME_LENGTH) };
    case 'toggle-ceremony':
      return {
        ...state,
        attending: state.attending.includes(action.id)
          ? state.attending.filter((id) => id !== action.id)
          : [...state.attending, action.id],
      };
    case 'extra-guests':
      return { ...state, extraGuests: clamp(action.value, 0, MAX_EXTRA_GUESTS) };
    case 'meal':
      return { ...state, meal: action.value };
    case 'message':
      return { ...state, message: action.value.slice(0, MAX_MESSAGE_LENGTH) };
    case 'submit':
      return canSubmitRsvp(state) ? { ...state, submitted: true } : state;
    case 'reset':
      return initialRsvpState();
    default:
      return state;
  }
}

/** A reply needs a name and at least one ceremony, and can only be sent once. */
export function canSubmitRsvp(state: RsvpState): boolean {
  return !state.submitted && state.name.trim().length > 0 && state.attending.length > 0;
}

/** Only ceremonies the guest can actually see count towards their reply. */
export function attendingWithin(state: RsvpState, visibleIds: readonly string[]): string[] {
  return state.attending.filter((id) => visibleIds.includes(id));
}
