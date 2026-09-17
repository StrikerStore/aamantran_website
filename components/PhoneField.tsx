'use client';

import { COUNTRIES, POPULAR_ISO, DIAL_CODES_BY_LENGTH } from '@/lib/dialCodes';
import { IS_INTL } from '@/lib/storefront';

/**
 * Country code picker plus a number input.
 *
 * A native `<select>`, deliberately, not a free-text code box: a couple's phone
 * number is write-once on the account (the dashboard refuses to change it and
 * sends them to a support ticket), so `19` typed for `91` would be a permanent
 * unroutable number. A select makes an invalid code structurally impossible.
 *
 * Native rather than a custom combobox because it brings the mobile OS picker,
 * keyboard type-ahead and correct accessibility for free — and most of this
 * traffic is mobile. The popular markets are pinned in an optgroup so the common
 * choice is one tap, with every other country still reachable below.
 *
 * Collapsed it shows only the dial code; the list shows "+1 · United States".
 * A native select renders the selected option's text when closed and cannot
 * differ between the two states, so the select is overlaid transparently on a
 * box this component draws (see .phone-cc in extra.css) — our text, the
 * browser's behaviour.
 *
 * Several countries share a dial code (+1 is the US, Canada and much of the
 * Caribbean). Options are keyed by dial code because that is all that is stored,
 * so reopening the list highlights the first country with that code rather than
 * the one picked. The collapsed value is unambiguous either way, and the code is
 * the only part that affects the number.
 *
 * No emoji flags: Windows renders country-flag emoji as bare letters, so they
 * would look broken for a good share of desktop visitors.
 */

const DEFAULT_DIAL = IS_INTL ? '+1' : '+91';

const POPULAR = POPULAR_ISO
  .map((iso) => COUNTRIES.find((c) => c[1] === iso))
  .filter(Boolean) as typeof COUNTRIES;

const REST = [...COUNTRIES].sort((a, b) => a[2].localeCompare(b[2]));

/**
 * Split typed input into a dial code and a national number.
 *
 * MIRRORS aamantran_backend/src/utils/phone.js. The backend is the authority and
 * re-runs this on submit; this copy exists so the field can correct itself as
 * the user types.
 *
 * The rule that keeps it unambiguous: a dial code is only ever stripped off the
 * number when the user explicitly wrote `+` or `00`. Without that marker the
 * picker is trusted and only a leading trunk zero is dropped — because with a
 * `+1` picker and `1234567890` typed, a stray country code and a real leading
 * `1` are indistinguishable, and guessing would delete a digit from a valid
 * number.
 */
export function splitTyped(rawCode: string, rawNumber: string): { code: string; national: string } {
  const code = rawCode || DEFAULT_DIAL;
  const s = String(rawNumber ?? '').trim().replace(/^00/, '+');
  const explicit = s.startsWith('+');
  const digits = s.replace(/\D/g, '');

  if (explicit && digits) {
    const matched = DIAL_CODES_BY_LENGTH.find((c) => digits.startsWith(c.slice(1)));
    if (matched) {
      // Someone who took the trouble to type +1 into a +91 form meant +1.
      return { code: matched, national: digits.slice(matched.length - 1) };
    }
    return { code, national: digits };
  }
  return { code, national: digits.replace(/^0/, '') };
}

export interface PhoneFieldProps {
  countryCode: string;
  number: string;
  onChange: (next: { countryCode: string; number: string }) => void;
  id?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  selectClassName?: string;
  /** Ids of the hint and error for the number input, so they are read with it. */
  describedBy?: string;
  invalid?: boolean;
}

export default function PhoneField({
  countryCode,
  number,
  onChange,
  id,
  placeholder = 'Contact number',
  required,
  disabled,
  className,
  selectClassName,
  describedBy,
  invalid,
}: PhoneFieldProps) {
  const code = countryCode || DEFAULT_DIAL;

  function handleNumber(value: string) {
    // Re-split on every keystroke so pasting a full +1… number moves the picker
    // instead of leaving it disagreeing with what is on screen.
    const next = splitTyped(code, value);
    onChange({ countryCode: next.code, number: next.national });
  }

  return (
    <div className="phone-field">
      {/*
        A native <select> always renders the selected option's full text when
        closed, so it cannot show "+1" collapsed and "+1 · United States" in the
        list. The select is therefore laid transparently over a box we draw
        ourselves: the visible text is ours, every native behaviour is still the
        browser's — the OS picker on mobile, keyboard type-ahead, and the
        accessibility tree. `.phone-cc:focus-within` moves the focus ring onto
        the visible box.
      */}
      <div className={`phone-cc${disabled ? ' is-disabled' : ''}`}>
        <span className="phone-cc-code" aria-hidden="true">{code}</span>
        <span className="phone-cc-caret" aria-hidden="true" />
        <select
          aria-label="Country code"
          className={`phone-cc-native${selectClassName ? ' ' + selectClassName : ''}`}
          value={code}
          disabled={disabled}
          onChange={(e) => onChange({ countryCode: e.target.value, number })}
        >
          <optgroup label="Popular">
            {POPULAR.map(([dial, iso, name]) => (
              <option key={`pop-${iso}`} value={dial}>{dial} · {name}</option>
            ))}
          </optgroup>
          <optgroup label="All countries">
            {REST.map(([dial, iso, name]) => (
              <option key={iso} value={dial}>{dial} · {name}</option>
            ))}
          </optgroup>
        </select>
      </div>

      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={number}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        onChange={(e) => handleNumber(e.target.value)}
        className={`phone-number${className ? ' ' + className : ''}`}
      />
    </div>
  );
}
