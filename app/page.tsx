import { Fragment } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import TemplatesCarousel from '@/components/TemplatesCarousel';
import ScrollReveal from '@/components/ScrollReveal';
import HomeReviews from '@/components/HomeReviews';

export const metadata: Metadata = {
  title: 'Aamantran — Beautiful Digital Wedding Invitations',
  description:
    'Stunning digital invitations your guests will open, save, and remember — with seamless RSVP, WhatsApp sharing, and every ceremony covered in one elegant link.',
};

const CHECKLIST_ITEMS = [
  'Personalised design', 'Live RSVP tracking', 'WhatsApp-ready link',
  'Multiple events, one URL', 'Photo gallery & music', 'Guest management',
];
const COMPARISON_ROWS = [
  'Cost',
  'Guest updates',
  'RSVP tracking',
  'Send last-minute changes',
  'WhatsApp ready',
  'Photo & music gallery',
  'Google Maps embed',
];
export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="hero" id="hero">
        <div className="hero-inner">
          <div className="hero-badge" id="hero-badge">
            <span className="star">★★★★★</span>
            <span>Loved by couples across India</span>
          </div>
          <h1 className="hero-h1">
            Your love story,<br />
            <em>beautifully told.</em>
          </h1>
          <p className="hero-sub">
            Stunning digital invitations your guests will open, save, and remember — with seamless RSVP, WhatsApp sharing, and every ceremony covered in one elegant link.
          </p>
        </div>
        <HeroCarousel />
      </section>

      {/* ── CHECKLIST STRIP ── */}
      <section className="checklist-strip" id="checklist">
        <div className="strip-track">
          {[0, 1].map(set => (
            <div className="strip-set" key={set} aria-hidden={set === 1}>
              {CHECKLIST_ITEMS.map(item => (
                <Fragment key={item}>
                  <div className="check-item"><span className="chk">✓</span> {item}</div>
                  <div className="strip-dot" />
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── TEMPLATES SHOWCASE ── */}
      <section className="templates-section" id="templates">
        <div className="container">
          <p className="eyebrow center">Designs</p>
          <h2 className="section-h2 center">Choose your <em>style.</em></h2>
          <p className="section-body center">Every template is hand-crafted — warm, romantic, and made to feel authentically yours.</p>
        </div>
        <TemplatesCarousel />
        <div className="center" style={{ marginTop: 40 }}>
          <Link href="/templates" className="btn-primary">Browse all templates →</Link>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="features-section" id="features">
        <div className="container">
          <p className="eyebrow center">What&apos;s included</p>
          <h2 className="section-h2 center">Everything your wedding&nbsp;<em>deserves.</em></h2>

          <div className="features-grid">
            {/* Large card */}
            <ScrollReveal className="feat-card large-card" delay={0}>
              <div className="feat-visual envelope-mini">
                <div className="mini-env">
                  <div className="mini-flap"></div>
                  <div className="mini-body">
                    <p>Priya &amp; Arjun</p>
                    <span>13 Dec 2026</span>
                  </div>
                  <div className="mini-seal">💍</div>
                </div>
              </div>
              <div className="feat-text">
                <h3>Digital envelope with wax seal</h3>
                <p>Your guests tap to unwrap a beautifully animated envelope — a moment of magic before your invitation is revealed.</p>
              </div>
            </ScrollReveal>

            {[
              { icon: '📊', title: 'Live RSVP dashboard', text: "See who's coming, who declined, meals preferred, and headcount per event — all in real time." },
              { icon: '📅', title: 'Every function, one link', text: 'Haldi, Sangeet, Wedding, Reception — your guests RSVP to each event independently. No more confusion.' },
              { icon: '💬', title: 'WhatsApp-native sharing', text: 'Share a personalised link per guest that auto-fills their name. Beautiful card preview appears in chat.' },
              { icon: '🎵', title: 'Background music', text: 'Add a song that plays as your guests scroll through your invitation. Set the mood before they arrive.' },
              { icon: '📸', title: 'Photo gallery', text: 'Showcase your pre-wedding shoot or candid family moments — right inside your invitation.' },
              { icon: '📍', title: 'Google Maps embed', text: 'Each venue is pinned with directions baked in. One tap and your guests are navigating there.' },
              { icon: '⏳', title: 'Live countdown timer', text: "A beautiful countdown to your wedding day, updating every second on your guests' screens." },
            ].map(({ icon, title, text }, i) => (
              <ScrollReveal key={title} className="feat-card" delay={i * 80}>
                <div className="feat-icon-wrap">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="howitworks-section" id="how">
        <div className="container">
          <p className="eyebrow center">The process</p>
          <h2 className="section-h2 center">Ready in <em>3 simple steps.</em></h2>

          <div className="steps-row">
            {[
              { num: '01', icon: '🎨', title: 'Choose your template', text: 'Browse 20+ hand-crafted designs. Pick the one that feels like you and pay once — securely via UPI or card.' },
              null, // connector
              { num: '02', icon: '✏️', title: 'Register & fill in your details', text: 'After payment, create your couple dashboard account. Enter names, dates, venues, photos, and music. Your invitation updates live as you type.' },
              null,
              { num: '03', icon: '📲', title: 'Share with your guests', text: 'Your personalised link is ready instantly. Share via WhatsApp, copy the URL, and watch RSVPs roll in from your dashboard.' },
            ].map((item, i) =>
              item === null
                ? <div key={`conn-${i}`} className="step-connector"><span>→</span></div>
                : (
                  <ScrollReveal key={item.num} className="step" delay={i * 120}>
                    <div className="step-num">{item.num}</div>
                    <div className="step-icon">{item.icon}</div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </ScrollReveal>
                )
            )}
          </div>

          <div className="center" style={{ marginTop: 56 }}>
            <Link href="/templates" className="btn-primary">Browse templates →</Link>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="comparison-section" id="comparison">
        <div className="container">
          <p className="eyebrow center">Why digital?</p>
          <h2 className="section-h2 center">Which invitation&nbsp;<em>really works?</em></h2>

          <div className="comparison-table">
            {/* Labels */}
            <div className="comp-col comp-header-col">
              <div className="comp-header-cell"></div>
              {COMPARISON_ROWS.map(r => (
                <div key={r} className="comp-row-label">{r}</div>
              ))}
            </div>
            {/* Printed */}
            <div className="comp-col comp-paper">
              <div className="comp-col-header paper-header"><span className="comp-icon">🖨️</span><span>Printed cards</span></div>
              <div className="comp-cell bad">₹10,000–₹40,000</div>
              <div className="comp-cell bad">✗ None</div>
              <div className="comp-cell bad">✗ Manual calls</div>
              <div className="comp-cell bad">✗ Reprint needed</div>
              <div className="comp-cell bad">✗ No</div>
              <div className="comp-cell bad">✗ No</div>
              <div className="comp-cell bad">✗ No</div>
            </div>
            {/* Video */}
            <div className="comp-col comp-video">
              <div className="comp-col-header video-header"><span className="comp-icon">🎥</span><span>Video Invitation</span></div>
              <div className="comp-cell mid">₹4,000–₹5,000</div>
              <div className="comp-cell bad">✗ None</div>
              <div className="comp-cell bad">✗ None</div>
              <div className="comp-cell mid">~ Re-edit needed, slow</div>
              <div className="comp-cell mid">~ Shareable</div>
              <div className="comp-cell mid">~ In video only</div>
              <div className="comp-cell bad">✗ No</div>
            </div>
            {/* Aamantran */}
            <div className="comp-col comp-digital">
              <div className="comp-col-header digital-header">
                <span className="comp-best-badge">⭐ Recommended</span>
                <span className="comp-icon">✨</span>
                <span>Aamantran</span>
              </div>
              <div className="comp-cell good">From ₹999</div>
              <div className="comp-cell good">✓ Real-time</div>
              <div className="comp-cell good">✓ Live dashboard</div>
              <div className="comp-cell good">✓ Instant</div>
              <div className="comp-cell good">✓ Yes</div>
              <div className="comp-cell good">✓ Yes</div>
              <div className="comp-cell good">✓ Yes</div>
            </div>
          </div>
          <div className="comparison-mobile-cards" aria-label="Invitation comparison">
            <article className="comp-mobile-card">
              <header className="comp-mobile-head paper-header">
                <span className="comp-icon">🖨️</span>
                <span>Printed cards</span>
              </header>
              <div className="comp-mobile-body">
                <div><span>{COMPARISON_ROWS[0]}</span><strong>₹10,000–₹40,000</strong></div>
                <div><span>{COMPARISON_ROWS[1]}</span><strong>✗ None</strong></div>
                <div><span>{COMPARISON_ROWS[2]}</span><strong>✗ Manual calls</strong></div>
                <div><span>{COMPARISON_ROWS[3]}</span><strong>✗ Reprint needed</strong></div>
                <div><span>{COMPARISON_ROWS[4]}</span><strong>✗ No</strong></div>
                <div><span>{COMPARISON_ROWS[5]}</span><strong>✗ No</strong></div>
                <div><span>{COMPARISON_ROWS[6]}</span><strong>✗ No</strong></div>
              </div>
            </article>

            <article className="comp-mobile-card">
              <header className="comp-mobile-head video-header">
                <span className="comp-icon">🎥</span>
                <span>Video Invitation</span>
              </header>
              <div className="comp-mobile-body">
                <div><span>{COMPARISON_ROWS[0]}</span><strong>₹4,000–₹5,000</strong></div>
                <div><span>{COMPARISON_ROWS[1]}</span><strong>✗ None</strong></div>
                <div><span>{COMPARISON_ROWS[2]}</span><strong>✗ None</strong></div>
                <div><span>{COMPARISON_ROWS[3]}</span><strong>~ Re-edit needed, slow</strong></div>
                <div><span>{COMPARISON_ROWS[4]}</span><strong>~ Shareable</strong></div>
                <div><span>{COMPARISON_ROWS[5]}</span><strong>~ In video only</strong></div>
                <div><span>{COMPARISON_ROWS[6]}</span><strong>✗ No</strong></div>
              </div>
            </article>

            <article className="comp-mobile-card comp-mobile-best">
              <header className="comp-mobile-head digital-header">
                <span className="comp-best-badge">⭐ Recommended</span>
                <span className="comp-icon">✨</span>
                <span>Aamantran</span>
              </header>
              <div className="comp-mobile-body">
                <div><span>{COMPARISON_ROWS[0]}</span><strong>From ₹999</strong></div>
                <div><span>{COMPARISON_ROWS[1]}</span><strong>✓ Real-time</strong></div>
                <div><span>{COMPARISON_ROWS[2]}</span><strong>✓ Live dashboard</strong></div>
                <div><span>{COMPARISON_ROWS[3]}</span><strong>✓ Instant</strong></div>
                <div><span>{COMPARISON_ROWS[4]}</span><strong>✓ Yes</strong></div>
                <div><span>{COMPARISON_ROWS[5]}</span><strong>✓ Yes</strong></div>
                <div><span>{COMPARISON_ROWS[6]}</span><strong>✓ Yes</strong></div>
              </div>
            </article>
          </div>

          <div className="comp-cta center">
            <Link href="/templates" className="btn-primary">Browse templates →</Link>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="reviews-section" id="reviews">
        <div className="container">
          <p className="eyebrow center">What couples say</p>
          <h2 className="section-h2 center">Stories of <em>happy celebrations.</em></h2>

          <HomeReviews />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final-cta" id="final-cta">
        <div className="container">
          <h2 className="final-h2">Have an idea to improve Aamantran?</h2>
          <p className="final-sub">Share your suggestions, feedback, or collaboration ideas with us. We would love to hear from you and build together.</p>
          <a href="mailto:aamantran@plexzuu.com" className="btn-primary large">Mail us at aamantran@plexzuu.com →</a>
        </div>
      </section>
    </>
  );
}
