import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us — Aamantran',
  description: 'Learn the story behind Aamantran — built by people who believe every Indian love story deserves a beautiful, modern invitation.',
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <span className="page-eyebrow">Our story</span>
        <h1 className="page-title">We believe every love story<br /><em>deserves a beautiful beginning.</em></h1>
        <p className="page-subtitle">Aamantran was born from a simple frustration — why should beautiful wedding invitations cost a fortune and end up in the bin?</p>
      </section>

      <main className="page-body wide">
        <div className="stats-row">
          {[
            { num: '500+', label: 'Couples served' },
            { num: '20+', label: 'Curated templates' },
            { num: '24 hrs', label: 'Avg. setup time' },
            { num: '5 ★', label: 'Average rating' },
          ].map(s => (
            <div key={s.label} className="stat-item">
              <span className="stat-num">{s.num}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="about-grid">
          <div className="about-text">
            <h2>How <em>Aamantran</em> began</h2>
            <p>It started at a wedding in Jaipur. Our founders watched a couple spend ₹35,000 on printed cards — cards that guests glanced at once and left on the table. There was no RSVP, no way to know who was coming, and when the venue changed last minute, there was no way to tell anyone.</p>
            <p>That evening, the question was simple: why doesn&apos;t a better solution exist for Indian weddings? One that&apos;s beautiful enough to feel special, smart enough to handle RSVPs, and affordable enough that every couple can access it.</p>
            <p>Aamantran — which means <em>invitation</em> in Sanskrit — is our answer to that question.</p>
          </div>
          <div className="about-visual">💌</div>
        </div>

        <div className="about-grid reverse">
          <div className="about-visual">🎨</div>
          <div className="about-text">
            <h2>Built for <em>Indian celebrations</em></h2>
            <p>Indian weddings are unlike any other — multi-day, multi-venue, multi-event celebrations filled with colour, ritual, and family. We designed Aamantran from the ground up for this reality.</p>
            <p>Our templates embrace the warmth of Indian aesthetics — from deep burgundy and gold to floral patterns and Mughal motifs. Every element is crafted to feel at home in a WhatsApp message between family members.</p>
            <p>From Haldi to Reception, your guests can RSVP to each ceremony independently. No confusion. No missed calls. No spreadsheets.</p>
          </div>
        </div>

        <p className="eyebrow center" style={{ marginTop: 0 }}>What guides us</p>
        <h2 className="section-h2 center">Our <em>values</em></h2>

        <div className="values-grid">
          {[
            { icon: '💎', title: 'Beautifully crafted', text: "Every template is hand-designed. We care about typography, colour, and the small details that make an invitation feel luxurious — not templated." },
            { icon: '❤️', title: 'Personal always', text: "Your dashboard is built for real people, not tech experts. Every field is clearly labelled, every change is instant, and your invitation looks exactly as it should — because you're in full control." },
            { icon: '⚡', title: 'Ready in minutes', text: "Weddings are stressful enough. With Aamantran you can go from sign-up to sharing your live invitation in under 30 minutes — no waiting, no back-and-forth." },
            { icon: '🔒', title: 'Private & secure', text: "Your guest data belongs to you. We never share, sell, or use your information for anything beyond running your invitation. Simple as that." },
            { icon: '💸', title: 'Genuinely affordable', text: "A beautiful digital invitation shouldn't cost more than a new outfit. Starting at ₹999, we've made sure every couple can access something they're proud of." },
            { icon: '🌱', title: 'Kinder to the planet', text: "Every digital invitation saves trees, reduces waste, and skips the logistics of printing and delivery. Looking beautiful and doing good — that's the goal." },
          ].map(v => (
            <div key={v.title} className="value-card">
              <span className="value-icon">{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>

        <div className="about-cta-strip">
          <h2>Ready to create yours?</h2>
          <p>Join hundreds of couples who gave their guests a moment of magic before the big day arrived.</p>
          <Link href="/templates" className="btn-white">Create your invitation →</Link>
          <p style={{ marginTop: 16, fontSize: '0.95rem', opacity: 0.85 }}>
            Questions? WhatsApp us at{' '}
            <a href="https://wa.me/919174773644" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>
              +91 91747 73644
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
