import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Aamantran',
  description: "Aamantran's Privacy Policy — how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="page-hero">
        <span className="page-eyebrow">Legal</span>
        <h1 className="page-title">Privacy <em>Policy</em></h1>
        <p className="page-subtitle">We respect your privacy and are committed to protecting your personal information. Here&apos;s exactly what we collect and why.</p>
      </section>

      <main className="page-body">
        <div className="prose">
          <span className="last-updated">Last updated: 5 April 2026</span>

          <div className="highlight-box">
            <p><strong>The short version:</strong> We collect only what we need to run your digital e-invitation. We never sell your data. Your guest list belongs to you, always. <strong>We do not ship physical products</strong> — our service is online only.</p>
          </div>

          <h2>1. Who we are</h2>
          <p><strong>Aamantran</strong> is a brand under <strong>PLEXZUU</strong>. Aamantran (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a digital wedding invitation service operated in India. Our platform enables couples to create, customise, and share <strong>digital (e-)invitations</strong> for their weddings and events. Purchases are for online access and features only; <strong>no physical products are delivered</strong>. You can reach us at <a href="mailto:aamantran@plexzuu.com">aamantran@plexzuu.com</a>.</p>

          <h2>2. Information we collect</h2>
          <h3>Information you provide directly</h3>
          <ul>
            <li><strong>Account information:</strong> Your name, email address, and phone number when you place an order or contact us.</li>
            <li><strong>Wedding details:</strong> Names of the couple, event dates, venue names, and ceremony details needed to create your invitation.</li>
            <li><strong>Guest information:</strong> Names, phone numbers, or email addresses of your guests if you use our guest management features. This data is provided by you and belongs to you.</li>
            <li><strong>Payment information:</strong> We do not store your card or bank details. Payments are processed by third-party providers (Razorpay / UPI) and are subject to their privacy policies.</li>
            <li><strong>Communications:</strong> Messages you send us via WhatsApp, email, or our contact form.</li>
          </ul>

          <h3>Information collected automatically</h3>
          <ul>
            <li><strong>Usage data:</strong> Pages visited, features used, and time spent on the invitation microsite (aggregated, not personally identifiable).</li>
            <li><strong>Device information:</strong> Browser type, operating system, and approximate geographic region (country/state level only).</li>
            <li><strong>RSVP responses:</strong> When a guest submits an RSVP, we record their response, name, and meal preference as entered by them.</li>
          </ul>

          <h2>3. How we use your information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Design, build, and deliver your digital invitation.</li>
            <li>Send you your invitation link and any important updates related to your order.</li>
            <li>Provide you with your RSVP dashboard and guest management tools.</li>
            <li>Respond to your questions and support requests.</li>
            <li>Improve our templates, features, and overall service quality.</li>
            <li>Send you transactional messages (order confirmation, delivery notification). We do not send marketing emails without your explicit consent.</li>
          </ul>

          <h2>4. Guest data</h2>
          <p>Guest information (names, phone numbers, RSVP responses) uploaded or collected through your invitation is treated as your data. We act as a data processor on your behalf. Specifically:</p>
          <ul>
            <li>We do not contact your guests for any purpose other than delivering RSVP confirmation messages requested by you.</li>
            <li>We do not use guest data for marketing or third-party profiling.</li>
            <li>You can request export or deletion of your guest data at any time by emailing us.</li>
            <li>Guest data is automatically deleted 90 days after your event date, unless you request earlier deletion.</li>
          </ul>

          <h2>5. Data sharing</h2>
          <p>We do not sell, rent, or trade your personal information. We share data only in these limited circumstances:</p>
          <ul>
            <li><strong>Service providers:</strong> We work with trusted third-party services (cloud hosting, payment processing) who handle data only as needed to provide their services and are contractually bound to protect it.</li>
            <li><strong>Legal requirements:</strong> We may disclose data if required by law, court order, or to protect the rights and safety of our users or the public.</li>
          </ul>

          <h2>6. Your rights</h2>
          <p>You have the right to access, correct, or delete your personal information at any time. To exercise these rights, contact us at <a href="mailto:aamantran@plexzuu.com">aamantran@plexzuu.com</a>. We will respond within 7 business days.</p>

          <h2>7. Cookies</h2>
          <p>We use minimal cookies — only those essential for the platform to function (session management, authentication). We do not use tracking cookies or third-party advertising cookies.</p>

          <h2>8. Changes to this policy</h2>
          <p>We may update this policy from time to time. If we make significant changes, we will notify you by email or by placing a prominent notice on our website. The date at the top of this page indicates the most recent revision.</p>

          <h2>9. Contact us</h2>
          <p>If you have any questions about this Privacy Policy or how we handle your data, please contact us at <a href="mailto:aamantran@plexzuu.com">aamantran@plexzuu.com</a>.</p>
        </div>
      </main>
    </>
  );
}
