'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Button, LinkButton } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field, TextInput } from '@/components/ui/Field';
import { createTrialDemo, getTrialDemoOptions } from '@/lib/api/trialDemo';
import { SELF_BUILD } from '@/lib/content/entitlements';
import { TRY_DEMO, tryDemoPrivacyNote } from '@/lib/content/tryDemo';
import { track } from '@/lib/track';
import {
  EMPTY_VALUES,
  FALLBACK_CEREMONIES,
  MAX_CEREMONIES,
  STEP_FIELDS,
  ceremonyDateBounds,
  checkoutHrefWithTrial,
  firstInvalidStep,
  formatCountdown,
  loadStoredTryDemo,
  saveStoredTryDemo,
  setWeddingDate,
  stepForField,
  toRequestBody,
  toggleCeremony,
  updateCeremony,
  validateStep,
  weddingDateBounds,
  whatsappShareUrl,
  type FieldErrors,
  type Step,
  type TryDemoField,
  type TryDemoResult,
  type TryDemoValues,
} from '@/lib/trialDemo';
import { TRY_DEMO_EVENT, type TryDemoEventDetail } from './TryDemoButton';
import styles from './TryDemoSheet.module.css';

const STEP_TITLES: Record<Step, string> = {
  1: 'The couple',
  2: 'Date and venue',
  3: 'Ceremonies',
};

function withoutError(errors: FieldErrors, field: TryDemoField): FieldErrors {
  if (!errors[field]) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}

/**
 * "Try it with your names": a three-step form, then the design filled in with
 * what the visitor typed.
 *
 * One per product page, opened by TryDemoButton from anywhere on the page, or
 * by arriving with ?try=1 from a gallery card. Nothing is sent until the last
 * step, and the only request goes from the visitor's browser straight to the
 * API. Analytics carry the design and a ceremony count, never a name.
 */
export function TryDemoSheet({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'form' | 'result'>('form');
  const [step, setStep] = useState<Step>(1);
  const [values, setValues] = useState<TryDemoValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TryDemoResult | null>(null);
  const [ceremonyOrder, setCeremonyOrder] = useState<string[]>(FALLBACK_CEREMONIES);
  const [linkMinutes, setLinkMinutes] = useState<number>(TRY_DEMO.linkMinutes);
  const [now, setNow] = useState(0);
  const [copied, setCopied] = useState(false);

  const startedAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const optionsRequested = useRef(false);
  const openedToken = useRef<string | null>(null);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const copiedTimer = useRef<number | undefined>(undefined);
  const baseId = useId();
  const fieldId = (field: TryDemoField) => `${baseId}-${field}`;

  const openSheet = useCallback(
    (source: string) => {
      const current = Date.now();
      const stored = loadStoredTryDemo();
      const live = stored?.result && stored.result.slug === slug && stored.result.expiresAt > current ? stored.result : null;
      startedAt.current = current;
      setNow(current);
      if (stored) setValues(stored.values);
      setResult(live);
      setView(live ? 'result' : 'form');
      setStep(1);
      setErrors({});
      setFormError('');
      setCopied(false);
      setOpen(true);
      track('try_demo_started', { slug, source });

      if (!optionsRequested.current) {
        optionsRequested.current = true;
        getTrialDemoOptions().then((options) => {
          if (!options) return;
          setCeremonyOrder(options.ceremonies);
          setLinkMinutes(options.expiresInMinutes);
        });
      }
    },
    [slug],
  );

  // Opened by a button anywhere on the page, or by ?try=1 in the address.
  useEffect(() => {
    function handleOpen(event: Event) {
      openSheet((event as CustomEvent<TryDemoEventDetail>).detail?.source ?? 'unknown');
    }
    window.addEventListener(TRY_DEMO_EVENT, handleOpen);

    let frame = 0;
    const params = new URLSearchParams(window.location.search);
    if (params.get('try') === '1') {
      frame = window.requestAnimationFrame(() => {
        // Dropped from the address so a reload or a shared URL does not reopen it.
        params.delete('try');
        const query = params.toString();
        window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
        openSheet('link');
      });
    }
    return () => {
      window.removeEventListener(TRY_DEMO_EVENT, handleOpen);
      window.cancelAnimationFrame(frame);
    };
  }, [openSheet]);

  // The countdown only runs while someone can see it.
  useEffect(() => {
    if (!open || view !== 'result' || !result) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [open, view, result]);

  // Remembered for this tab, so "Edit details" and a reload keep what was typed.
  useEffect(() => {
    if (open) saveStoredTryDemo({ values, result });
  }, [open, values, result]);

  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  function change(next: TryDemoValues, field: TryDemoField) {
    setValues(next);
    setErrors((current) => withoutError(current, field));
  }

  function focusSoon(getElement: () => HTMLElement | null) {
    window.requestAnimationFrame(() => getElement()?.focus());
  }

  function showErrors(target: Step, found: FieldErrors) {
    setView('form');
    setStep(target);
    setErrors(found);
    const first = STEP_FIELDS[target].find((field) => found[field]);
    if (first) focusSoon(() => document.getElementById(fieldId(first)));
  }

  function goToStep(target: Step) {
    setErrors({});
    setFormError('');
    setStep(target);
    focusSoon(() => stepHeading.current);
  }

  async function create() {
    const invalid = firstInvalidStep(values, new Date());
    if (invalid) {
      showErrors(invalid.step, invalid.errors);
      return;
    }
    setSubmitting(true);
    setFormError('');
    const response = await createTrialDemo(
      toRequestBody(values, { slug, startedAt: startedAt.current, website: honeypot.current?.value ?? '' }),
    );
    setSubmitting(false);

    if (!response.ok) {
      if (response.aborted) return;
      const target = response.status === 400 ? stepForField(response.field) : null;
      if (target && response.field) showErrors(target, { [response.field]: response.message });
      else setFormError(response.message);
      return;
    }

    const created: TryDemoResult = {
      slug,
      token: response.data.token,
      url: response.data.url,
      expiresAt: Date.now() + response.data.expiresInMinutes * 60 * 1000,
      linkMinutes: response.data.expiresInMinutes,
    };
    openedToken.current = null;
    setResult(created);
    setNow(Date.now());
    setCopied(false);
    setView('result');
    track('try_demo_created', { slug, ceremonyCount: values.ceremonies.length });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const found = validateStep(step, values, new Date());
    if (Object.keys(found).length > 0) {
      showErrors(step, found);
      return;
    }
    setErrors({});
    if (step < 3) {
      goToStep((step + 1) as Step);
      return;
    }
    await create();
  }

  function markOpened(via: 'inline' | 'full-screen') {
    if (!result || openedToken.current === `${result.token}:${via}`) return;
    openedToken.current = `${result.token}:${via}`;
    track('try_demo_opened', { slug, ceremonyCount: values.ceremonies.length, via });
  }

  function copyLink() {
    if (!result) return;
    const done = () => {
      setCopied(true);
      window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 3000);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(result.url).then(done, () => setCopied(false));
  }

  const remaining = result ? result.expiresAt - now : 0;
  const expired = !result || remaining <= 0;
  // `now` is set whenever the sheet opens, which is the only time these render.
  const weddingBounds = weddingDateBounds(new Date(now));
  const ceremonyBounds = ceremonyDateBounds(values.weddingDate);

  const title =
    view === 'form' ? `Try ${name} with your names` : expired ? 'Your demo link has ended' : 'Your demo is ready';

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title={title}
      size={view === 'result' ? 'lg' : 'md'}
      fullScreenOnMobile
    >
      {view === 'form' ? (
        <form noValidate onSubmit={handleSubmit} className={styles.form}>
          <h3 ref={stepHeading} tabIndex={-1} className={styles.stepHeading}>
            <span className={styles.stepCount}>Step {step} of 3</span>
            {STEP_TITLES[step]}
          </h3>

          {step === 1 && (
            <>
              <p className={styles.hint}>As you’d like them to appear on the invitation.</p>
              <Field label="Bride’s name" id={fieldId('brideName')} error={errors.brideName} required>
                {(control) => (
                  <TextInput
                    {...control}
                    value={values.brideName}
                    onChange={(e) => change({ ...values, brideName: e.target.value }, 'brideName')}
                    autoComplete="off"
                    autoCapitalize="words"
                    maxLength={60}
                  />
                )}
              </Field>
              <Field label="Groom’s name" id={fieldId('groomName')} error={errors.groomName} required>
                {(control) => (
                  <TextInput
                    {...control}
                    value={values.groomName}
                    onChange={(e) => change({ ...values, groomName: e.target.value }, 'groomName')}
                    autoComplete="off"
                    autoCapitalize="words"
                    maxLength={60}
                  />
                )}
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Wedding date" id={fieldId('weddingDate')} error={errors.weddingDate} required>
                {(control) => (
                  <TextInput
                    {...control}
                    type="date"
                    min={weddingBounds.min}
                    max={weddingBounds.max}
                    value={values.weddingDate}
                    onChange={(e) => change(setWeddingDate(values, e.target.value), 'weddingDate')}
                  />
                )}
              </Field>
              <Field label="Venue" id={fieldId('venueName')} error={errors.venueName} required>
                {(control) => (
                  <TextInput
                    {...control}
                    value={values.venueName}
                    onChange={(e) => change({ ...values, venueName: e.target.value }, 'venueName')}
                    autoComplete="off"
                    maxLength={80}
                  />
                )}
              </Field>
              <Field label="City" hint="Optional" id={fieldId('city')} error={errors.city}>
                {(control) => (
                  <TextInput
                    {...control}
                    value={values.city}
                    onChange={(e) => change({ ...values, city: e.target.value }, 'city')}
                    autoComplete="off"
                    maxLength={60}
                  />
                )}
              </Field>
            </>
          )}

          {step === 3 && (
            <fieldset
              className={styles.fieldset}
              aria-describedby={[`${baseId}-ceremony-hint`, errors.ceremonies ? `${baseId}-ceremony-error` : '']
                .filter(Boolean)
                .join(' ')}
            >
              <legend className={styles.legend}>Which ceremonies should it show?</legend>
              <p id={`${baseId}-ceremony-hint`} className={styles.hint}>
                Choose up to {MAX_CEREMONIES}. Dates start from your wedding date, and you can change any of them.
              </p>
              <div className={styles.chips}>
                {ceremonyOrder.map((ceremony, i) => {
                  const selected = values.ceremonies.some((c) => c.name === ceremony);
                  return (
                    <button
                      key={ceremony}
                      id={i === 0 ? fieldId('ceremonies') : undefined}
                      type="button"
                      className={styles.chip}
                      aria-pressed={selected}
                      disabled={!selected && values.ceremonies.length >= MAX_CEREMONIES}
                      onClick={() => change(toggleCeremony(values, ceremony, ceremonyOrder), 'ceremonies')}
                    >
                      {ceremony}
                    </button>
                  );
                })}
              </div>

              {values.ceremonies.length > 0 && (
                <ul className={styles.ceremonies}>
                  {values.ceremonies.map((ceremony) => (
                    <li key={ceremony.name} className={styles.ceremony}>
                      <span className={styles.ceremonyName}>{ceremony.name}</span>
                      <label className={styles.inline}>
                        <span>Date</span>
                        <TextInput
                          type="date"
                          min={ceremonyBounds?.min}
                          max={ceremonyBounds?.max}
                          value={ceremony.date}
                          onChange={(e) => change(updateCeremony(values, ceremony.name, { date: e.target.value }), 'ceremonies')}
                        />
                      </label>
                      <label className={styles.inline}>
                        <span>
                          Time <span className={styles.optional}>(optional)</span>
                        </span>
                        <TextInput
                          type="time"
                          value={ceremony.time}
                          onChange={(e) => change(updateCeremony(values, ceremony.name, { time: e.target.value }), 'ceremonies')}
                        />
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              {errors.ceremonies && (
                <p id={`${baseId}-ceremony-error`} className={styles.error}>
                  <span aria-hidden="true">⚠ </span>
                  {errors.ceremonies}
                </p>
              )}
            </fieldset>
          )}

          {/* Hidden from people; bots fill in every field they find. */}
          <div className={styles.trap} aria-hidden="true">
            <label>
              Leave this empty
              <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>

          {formError && (
            <p role="alert" className={styles.formError}>
              {formError}
            </p>
          )}

          <p className={styles.privacy}>
            {tryDemoPrivacyNote(linkMinutes)} <Link href="/privacy">Privacy policy</Link>
          </p>

          <div className={styles.nav}>
            {step > 1 && (
              <Button variant="secondary" onClick={() => goToStep((step - 1) as Step)} disabled={submitting}>
                Back
              </Button>
            )}
            <Button type="submit" loading={submitting}>
              {step < 3 ? 'Next' : 'Show my demo'}
            </Button>
          </div>
        </form>
      ) : (
        result && (
          <div className={styles.result}>
            <div className={styles.preview}>
              {expired ? (
                <div className={styles.ended}>
                  <p>
                    Demo links work for {result.linkMinutes} minutes, so the names you typed don’t stay on a page anyone
                    can open. Making it again takes a moment.
                  </p>
                </div>
              ) : (
                <iframe
                  key={result.token}
                  src={result.url}
                  title={`Preview of ${name} with your names`}
                  className={styles.frame}
                  referrerPolicy="no-referrer"
                  onLoad={() => markOpened('inline')}
                />
              )}
            </div>

            <div className={styles.side}>
              {expired ? (
                <Button onClick={() => void create()} loading={submitting} fullWidth>
                  Make it again
                </Button>
              ) : (
                <>
                  <p className={styles.countdown}>
                    Link works for another <time className={styles.time}>{formatCountdown(remaining)}</time>
                  </p>
                  <div className={styles.actions}>
                    <LinkButton
                      href={result.url}
                      target="_blank"
                      rel="noopener"
                      variant="secondary"
                      size="sm"
                      onClick={() => markOpened('full-screen')}
                    >
                      Open full screen<span className="visually-hidden"> (opens in a new tab)</span>
                    </LinkButton>
                    <LinkButton
                      href={whatsappShareUrl(result.url, result.linkMinutes)}
                      target="_blank"
                      rel="noopener"
                      variant="secondary"
                      size="sm"
                    >
                      Share on WhatsApp<span className="visually-hidden"> (opens in a new tab)</span>
                    </LinkButton>
                  </div>
                  <div className={styles.copy}>
                    <label htmlFor={`${baseId}-link`} className="visually-hidden">
                      Demo link
                    </label>
                    <TextInput
                      id={`${baseId}-link`}
                      readOnly
                      value={result.url}
                      onFocus={(e) => e.currentTarget.select()}
                      className={styles.linkField}
                    />
                    <Button variant="secondary" size="sm" onClick={copyLink}>
                      {copied ? 'Copied' : 'Copy link'}
                    </Button>
                  </div>
                  <p role="status" className="visually-hidden">
                    {copied ? 'Link copied' : ''}
                  </p>
                  <p className={styles.note}>{TRY_DEMO.watermarkNote}</p>
                </>
              )}

              {formError && (
                <p role="alert" className={styles.formError}>
                  {formError}
                </p>
              )}

              <div className={styles.buy}>
                <LinkButton
                  href={checkoutHrefWithTrial(slug, result.token)}
                  fullWidth
                  onClick={() => track('try_demo_to_checkout', { slug, ceremonyCount: values.ceremonies.length })}
                >
                  {TRY_DEMO.buyWithDetails}
                </LinkButton>
                <p className={styles.note}>{TRY_DEMO.buyNote}</p>
                <p className={styles.note}>{SELF_BUILD.short}</p>
              </div>

              <Button variant="ghost" onClick={() => { setView('form'); goToStep(1); }}>
                Edit details
              </Button>
            </div>
          </div>
        )
      )}
    </Dialog>
  );
}
