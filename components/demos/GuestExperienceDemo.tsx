'use client';

import { useMemo, useReducer, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { SAMPLE_CEREMONIES, SAMPLE_INVITE, SAMPLE_NOTICE, ceremonyDate } from '@/lib/content/sampleInvite';
import { cx } from '@/lib/cx';
import { canSubmitRsvp, initialRsvpState, rsvpReducer, MAX_EXTRA_GUESTS } from '@/lib/demos/guestRsvp';
import { formatDate } from '@/lib/format';
import { track } from '@/lib/track';
import styles from './GuestExperienceDemo.module.css';

/**
 * What a guest sees, as a guest sees it.
 *
 * Everything happens in this component: no request is made, nothing is stored,
 * and the RSVP goes nowhere. The rules are the real ones though — a reply needs
 * a name and at least one ceremony, and cannot be edited once sent — so the
 * demo does not promise behaviour the product does not have.
 *
 * `weddingDateIso` comes from the server so the dates are identical in the
 * server-rendered HTML and after hydration.
 */
export function GuestExperienceDemo({ weddingDateIso }: { weddingDateIso: string }) {
  const weddingDate = useMemo(() => new Date(weddingDateIso), [weddingDateIso]);
  const [scope, setScope] = useState<'full' | 'selected'>('full');
  const [rsvp, dispatch] = useReducer(rsvpReducer, undefined, initialRsvpState);
  const [wishes, setWishes] = useState<{ name: string; text: string }[]>(
    () => SAMPLE_INVITE.wishes.map((wish) => ({ name: wish.name, text: wish.text })),
  );
  const [wishDraft, setWishDraft] = useState({ name: '', text: '' });
  const reported = useRef<Set<string>>(new Set());

  /** One event per kind of interaction, so a curious visitor is not a hundred events. */
  function report(action: string) {
    if (reported.current.has(action)) return;
    reported.current.add(action);
    track('guest_demo_interaction', { action });
  }

  const ceremonies = scope === 'full'
    ? SAMPLE_CEREMONIES
    // The content file is `as const`, which narrows these ids to a literal
    // tuple; here they are compared as plain strings.
    : SAMPLE_CEREMONIES.filter((ceremony) => (SAMPLE_INVITE.partialCeremonyIds as readonly string[]).includes(ceremony.id));
  const visibleIds = ceremonies.map((ceremony) => ceremony.id);
  const attendingHere = rsvp.attending.filter((id) => visibleIds.includes(id));

  function addWish() {
    const name = wishDraft.name.trim().slice(0, 40);
    const text = wishDraft.text.trim().slice(0, 160);
    if (!name || !text) return;
    setWishes((current) => [{ name, text }, ...current]);
    setWishDraft({ name: '', text: '' });
    report('wish');
  }

  const eventDetails = (
    <div className={styles.panelInner}>
      <div className={styles.scope} role="group" aria-label="Which invitation">
        {(['full', 'selected'] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={scope === option}
            className={cx(styles.scopeButton, scope === option && styles.scopeActive)}
            onClick={() => {
              setScope(option);
              report('scope');
            }}
          >
            {option === 'full' ? 'Full invitation' : 'Selected ceremonies'}
          </button>
        ))}
      </div>
      <p className={styles.scopeNote}>
        {scope === 'full'
          ? 'Guests on the main link see every ceremony.'
          : 'A second link, included in the price, shows only the ceremonies you choose — for guests invited to part of the celebration.'}
      </p>
      <ol className={styles.ceremonies}>
        {ceremonies.map((ceremony) => (
          <li key={ceremony.id}>
            <p className={styles.ceremonyName}>{ceremony.name}</p>
            <p className={styles.ceremonyMeta}>
              {formatDate(ceremonyDate(ceremony, weddingDate), { month: 'short' })} · {ceremony.time}
            </p>
            <p className={styles.ceremonyMeta}>{ceremony.venue}</p>
            <p className={styles.ceremonyMeta}>Dress code: {ceremony.dressCode}</p>
          </li>
        ))}
      </ol>
    </div>
  );

  const directions = (
    <div className={styles.panelInner}>
      <div className={styles.map} aria-hidden="true">
        <span>Map</span>
      </div>
      <p className={styles.note}>
        On a real invitation this opens Google Maps with the venue pinned. Here it does nothing.
      </p>
      <Button variant="secondary" disabled aria-describedby="demo-map-note">
        Get directions
      </Button>
      <p id="demo-map-note" className={styles.note}>
        Each ceremony carries its own venue and map pin.
      </p>
    </div>
  );

  const rsvpPanel = (
    <div className={styles.panelInner}>
      {rsvp.submitted ? (
        <div className={styles.sent}>
          <p className={styles.sentTitle}>Thanks, {rsvp.name.trim()}.</p>
          <p className={styles.note}>
            You said yes to {attendingHere.length === 1 ? '1 ceremony' : `${attendingHere.length} ceremonies`}
            {rsvp.extraGuests > 0 ? `, bringing ${rsvp.extraGuests} more` : ''}.
          </p>
          <p className={styles.sentNote}>This is a sample. Nothing was sent, and no one was told.</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              dispatch({ type: 'reset' });
              report('reset');
            }}
          >
            Try again
          </Button>
        </div>
      ) : (
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            dispatch({ type: 'submit' });
            report('submit');
          }}
        >
          <label className={styles.label} htmlFor="demo-rsvp-name">
            Your name
          </label>
          <input
            id="demo-rsvp-name"
            className={styles.control}
            value={rsvp.name}
            autoComplete="off"
            onChange={(event) => {
              dispatch({ type: 'name', value: event.target.value });
              report('name');
            }}
          />

          {/* With one ceremony there is nothing to choose between. */}
          {ceremonies.length > 1 && (
            <fieldset className={styles.fieldset}>
              <legend className={styles.label}>Which will you attend?</legend>
              {ceremonies.map((ceremony) => (
                <label key={ceremony.id} className={styles.check}>
                  <input
                    type="checkbox"
                    checked={rsvp.attending.includes(ceremony.id)}
                    onChange={() => {
                      dispatch({ type: 'toggle-ceremony', id: ceremony.id });
                      report('ceremony');
                    }}
                  />
                  {ceremony.name}
                </label>
              ))}
            </fieldset>
          )}

          <label className={styles.label} htmlFor="demo-rsvp-guests">
            Anyone with you?
          </label>
          <select
            id="demo-rsvp-guests"
            className={styles.control}
            value={rsvp.extraGuests}
            onChange={(event) => {
              dispatch({ type: 'extra-guests', value: Number(event.target.value) });
              report('guests');
            }}
          >
            {Array.from({ length: MAX_EXTRA_GUESTS + 1 }, (_, i) => (
              <option key={i} value={i}>
                {i === 0 ? 'Just me' : `+${i}`}
              </option>
            ))}
          </select>

          <label className={styles.label} htmlFor="demo-rsvp-meal">
            Meal preference
          </label>
          <select
            id="demo-rsvp-meal"
            className={styles.control}
            value={rsvp.meal}
            onChange={(event) => {
              dispatch({ type: 'meal', value: event.target.value });
              report('meal');
            }}
          >
            <option value="">No preference</option>
            {SAMPLE_INVITE.mealOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <Button type="submit" disabled={!canSubmitRsvp(rsvp)} fullWidth>
            Send RSVP
          </Button>
          <p className={styles.note}>
            {canSubmitRsvp(rsvp)
              ? 'Nothing is sent — this is a sample invitation.'
              : 'Add your name and pick at least one ceremony.'}
          </p>
        </form>
      )}
    </div>
  );

  const wishesPanel = (
    <div className={styles.panelInner}>
      <div className={styles.wishForm}>
        <label className={styles.label} htmlFor="demo-wish-name">
          Your name
        </label>
        <input
          id="demo-wish-name"
          className={styles.control}
          value={wishDraft.name}
          autoComplete="off"
          onChange={(event) => setWishDraft((draft) => ({ ...draft, name: event.target.value }))}
        />
        <label className={styles.label} htmlFor="demo-wish-text">
          Your wish
        </label>
        <textarea
          id="demo-wish-text"
          className={cx(styles.control, styles.textarea)}
          value={wishDraft.text}
          onChange={(event) => setWishDraft((draft) => ({ ...draft, text: event.target.value }))}
        />
        <Button variant="secondary" onClick={addWish} disabled={!wishDraft.name.trim() || !wishDraft.text.trim()}>
          Add to the wall
        </Button>
        <p className={styles.note}>Added here only. On a real invitation the couple chooses which wishes show.</p>
      </div>
      <ul className={styles.wishes}>
        {wishes.map((wish, i) => (
          <li key={`${wish.name}-${i}`}>
            <p className={styles.wishText}>{wish.text}</p>
            <p className={styles.wishName}>{wish.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    // data-demo is a stable hook for the browser tests: the tabs' accessible
    // name sits on the tablist, which does not contain the panels.
    <div className={styles.wrap} data-demo="guest">
      <div className={styles.phone}>
        <div className={styles.screen}>
          <div className={styles.header}>
            <p className={styles.couple}>
              {SAMPLE_INVITE.couple.first} &amp; {SAMPLE_INVITE.couple.second}
            </p>
            <p className={styles.date}>
              {formatDate(weddingDate)} · {SAMPLE_INVITE.city}
            </p>
          </div>
          <Tabs
            label="Sample invitation"
            className={styles.tabs}
            onChange={(id) => report(`tab:${id}`)}
            items={[
              { id: 'details', label: 'Details', content: eventDetails },
              { id: 'directions', label: 'Directions', content: directions },
              { id: 'rsvp', label: 'RSVP', content: rsvpPanel },
              { id: 'wishes', label: 'Wishes', content: wishesPanel },
            ]}
          />
        </div>
      </div>
      {/* A sentence, not a label: Badge is a nowrap pill for short words and
          cannot shrink, which pushed the whole page sideways on a phone. */}
      <p className={styles.sampleNote}>{SAMPLE_NOTICE}</p>
    </div>
  );
}
