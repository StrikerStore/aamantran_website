'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { getCoupleDashboardUrl, getPublicApiUrl } from '@/lib/publicEnv';

const API = getPublicApiUrl();
const USER_DASHBOARD_URL = getCoupleDashboardUrl();

type UsernameCheck = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'linked';
type EmailCheck    = 'idle' | 'checking' | 'found' | 'new';

export default function OnboardingPage() {
  const params      = useSearchParams();
  const paymentId   = params.get('paymentId') || '';
  const slug        = params.get('slug') || '';
  const templateName = params.get('template') || 'your selected template';

  // Field state
  const [email,    setEmail]    = useState('');
  const [username, setUsername] = useState('');
  const [contact,  setContact]  = useState('');
  const [password, setPassword] = useState('');

  // Status state
  const [emailStatus,    setEmailStatus]    = useState<EmailCheck>('idle');
  const [autofillUser,   setAutofillUser]   = useState('');   // fetched from lookup
  const [usernameStatus, setUsernameStatus] = useState<UsernameCheck>('idle');
  const [isLinkedFlow,   setIsLinkedFlow]   = useState(false); // true = same account

  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [message,    setMessage]    = useState('');

  // ── Email lookup ─────────────────────────────────────────────────────
  const lookupEmail = useCallback(async (raw: string) => {
    const em = raw.trim().toLowerCase();
    if (!em || !em.includes('@')) { setEmailStatus('new'); return; }
    setEmailStatus('checking');
    try {
      const res  = await fetch(`${API}/api/checkout/lookup-email?email=${encodeURIComponent(em)}`);
      const data = await res.json();
      if (data.exists) {
        setEmailStatus('found');
        setAutofillUser(data.username);
        setUsername(data.username);
        setUsernameStatus('linked');
        setIsLinkedFlow(true);
      } else {
        setEmailStatus('new');
        setAutofillUser('');
        if (isLinkedFlow) { setUsername(''); setUsernameStatus('idle'); }
        setIsLinkedFlow(false);
      }
    } catch {
      setEmailStatus('new');
    }
  }, [isLinkedFlow]);

  useEffect(() => {
    const t = window.setTimeout(() => lookupEmail(email), 500);
    return () => window.clearTimeout(t);
  }, [email, lookupEmail]);

  // ── Username availability check (only for new accounts) ──────────────
  const checkUsername = useCallback(async (raw: string) => {
    const u = raw.trim();
    if (!u) { setUsernameStatus('idle'); return; }
    setUsernameStatus('checking');
    try {
      const res  = await fetch(`${API}/api/checkout/check-username?username=${encodeURIComponent(u)}`);
      const data = await res.json();
      setUsernameStatus(!data.available ? (data.reason === 'invalid' ? 'invalid' : 'taken') : 'available');
    } catch {
      setUsernameStatus('idle');
    }
  }, []);

  // When username changes, detect if user deviated from autofill
  useEffect(() => {
    const u = username.trim();
    if (autofillUser && u === autofillUser) {
      // Still the autofilled username — stay in linked flow
      setIsLinkedFlow(true);
      setUsernameStatus('linked');
      return;
    }
    if (autofillUser && u !== autofillUser) {
      // User changed username — switch to new account flow
      setIsLinkedFlow(false);
    }
    if (!u) { setUsernameStatus('idle'); return; }
    setUsernameStatus('checking');
    const t = window.setTimeout(() => checkUsername(u), 450);
    return () => window.clearTimeout(t);
  }, [username, autofillUser, checkUsername]);

  // ── Submit ────────────────────────────────────────────────────────────
  const passwordRequired = !isLinkedFlow;

  const disabled = useMemo(() => {
    if (!username.trim() || !email.trim() || !contact.trim() || !paymentId || !slug) return true;
    if (usernameStatus === 'taken' || usernameStatus === 'invalid' || usernameStatus === 'checking') return true;
    if (emailStatus === 'checking') return true;
    if (passwordRequired && !password.trim()) return true;
    return false;
  }, [username, email, contact, password, paymentId, slug, usernameStatus, emailStatus, passwordRequired]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (disabled || submitting) return;
    setSubmitting(true);
    setMessage('');
    try {
      const body: Record<string, string> = {
        paymentId,
        templateSlug: slug,
        username: username.trim(),
        email:    email.trim(),
        contact:  contact.trim(),
      };
      if (passwordRequired) body.password = password;

      const res  = await fetch(`${API}/api/checkout/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Registration failed');
      setDone(true);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">
        <Link href="/" className="onboarding-brand">
          <Image src="/logo.png" alt="" width={40} height={40} className="onboarding-brand-logo" />
          <span className="onboarding-brand-name">Aamantran</span>
        </Link>
        <h1>{templateName}</h1>
        <p className="onboarding-note">Thank you for buying this invitation template.</p>

        {done ? (
          <div className="onboarding-success">
            <h2>Registration successful</h2>
            <p>You can customise your template using the User Dashboard.</p>
            <a href={USER_DASHBOARD_URL} className="btn-primary large">
              Open User Dashboard →
            </a>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="onboarding-form">

            {/* ─── Email (first) ─────────────────────────────────────── */}
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            {emailStatus === 'checking' && (
              <p className="onboarding-help">Checking account…</p>
            )}
            {emailStatus === 'found' && (
              <p className="onboarding-info">
                ✅ Welcome back! This purchase will be added to your existing account.
              </p>
            )}

            {/* ─── Username ─────────────────────────────────────────── */}
            <label>
              Username (login)
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. priya_arjun"
                autoComplete="username"
                name="username"
              />
              <span className="onboarding-help" style={{ display: 'block', marginTop: 6 }}>
                {isLinkedFlow
                  ? 'This is your existing username. Change it to create a new separate account.'
                  : '3–32 characters: letters, numbers, dots, underscores, hyphens (lowercase).'}
              </span>
            </label>
            {!isLinkedFlow && username.trim() && usernameStatus === 'checking' && (
              <p className="onboarding-help" style={{ marginTop: 4 }}>Checking availability…</p>
            )}
            {!isLinkedFlow && username.trim() && usernameStatus === 'available' && (
              <p style={{ marginTop: 4, fontSize: '0.84rem', color: '#2e7d32' }}>This username is available.</p>
            )}
            {!isLinkedFlow && username.trim() && usernameStatus === 'taken' && (
              <p style={{ marginTop: 4, fontSize: '0.84rem', color: '#b42318' }}>This username is already taken. Choose another.</p>
            )}
            {!isLinkedFlow && username.trim() && usernameStatus === 'invalid' && (
              <p style={{ marginTop: 4, fontSize: '0.84rem', color: '#b42318' }}>
                Invalid username. Use 3–32 characters; start with a letter or number; only letters, numbers, . _ -
              </p>
            )}
            {!isLinkedFlow && autofillUser && username.trim() !== autofillUser && (
              <p style={{ marginTop: 4, fontSize: '0.84rem', color: '#b26b00' }}>
                ⚠️ New username = new separate account. Please set a password below.
              </p>
            )}

            {/* ─── Contact ──────────────────────────────────────────── */}
            <label>
              Contact
              <input
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="10-digit phone number"
                autoComplete="tel"
              />
            </label>

            {/* ─── Password ─────────────────────────────────────────── */}
            <label style={{ opacity: isLinkedFlow ? 0.45 : 1 }}>
              Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isLinkedFlow ? 'Password already set' : 'Create a password (min 8 chars)'}
                autoComplete="new-password"
                disabled={isLinkedFlow}
              />
              {isLinkedFlow && (
                <span className="onboarding-help" style={{ display: 'block', marginTop: 4 }}>
                  Password already set with this account.
                </span>
              )}
            </label>

            {message && <p className="onboarding-error">{message}</p>}

            <button className="btn-primary onboarding-register-btn" type="submit" disabled={disabled || submitting}>
              {submitting ? 'Registering…' : isLinkedFlow ? 'Link to My Account' : 'Create Account'}
            </button>

            <p className="onboarding-help">
              Already registered? <Link href={USER_DASHBOARD_URL}>Go to User Dashboard</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
