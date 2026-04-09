import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — Aamantran',
  description: "Aamantran's Terms of Service — the rules and guidelines that govern your use of our platform.",
};

export default function TermsPage() {
  return (
    <>
      <section className="page-hero">
        <span className="page-eyebrow">Legal</span>
        <h1 className="page-title">Terms of <em>Service</em></h1>
        <p className="page-subtitle">By using Aamantran, you agree to these terms. We&apos;ve written them in plain language — please take a few minutes to read through.</p>
      </section>

      <main className="page-body">
        <div className="prose">
          <span className="last-updated">Last updated: 5 April 2026</span>

          <h2>1. Acceptance of terms</h2>
          <p><strong>Aamantran</strong> is a brand under <strong>PLEXZUU</strong>. By accessing or using Aamantran&apos;s services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>

          <h2>2. What we provide</h2>
          <p>Aamantran is a digital wedding invitation platform that allows couples to create, customise, and share digital invitations and manage RSVPs from their guests. <strong>All purchases are for digital e-invitations only.</strong> We do not print, ship, or deliver any physical products (including printed cards, paper invitations, or merchandise).</p>
          <p>Our service includes:</p>
          <ul>
            <li>Access to a library of invitation templates</li>
            <li>A couple dashboard to personalise and manage your invitation</li>
            <li>A guest-facing invitation microsite with RSVP functionality</li>
            <li>Analytics and guest management tools</li>
          </ul>

          <h2>3. Your account</h2>
          <p>You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorised access at <a href="mailto:aamantran@plexzuu.com">aamantran@plexzuu.com</a>.</p>

          <h2>4. Payments</h2>
          <p>All payments are processed securely via Razorpay or UPI. Prices are shown in Indian Rupees (₹) and include applicable taxes. By completing a purchase, you authorise the charge for your <strong>digital e-invitation</strong> and related online services. <strong>No physical product is sold or delivered.</strong> See our <Link href="/refund">Refund Policy</Link> for cancellation terms.</p>

          <h2>5. Content you provide</h2>
          <p>You retain ownership of all content you provide — names, photos, venue details, and guest information. By providing this content, you grant us a limited licence to use it solely for the purpose of creating and operating your invitation. You confirm that you have the right to use all photos and content you provide.</p>

          <h2>6. Prohibited uses</h2>
          <p>You may not use Aamantran to:</p>
          <ul>
            <li>Create invitations for illegal events or activities</li>
            <li>Distribute spam or unsolicited messages to guests</li>
            <li>Infringe on any intellectual property rights</li>
            <li>Attempt to gain unauthorised access to our systems</li>
            <li>Resell, sublicense, or commercially exploit our templates or platform</li>
          </ul>

          <h2>7. Intellectual property</h2>
          <p>All templates, designs, UI elements, and code are owned by Aamantran and protected by copyright. You may use your purchased invitation for personal use only. You may not copy, modify, resell, or create derivative works from our templates.</p>

          <h2>8. Limitation of liability</h2>
          <p>Aamantran is not liable for any indirect, incidental, or consequential damages arising from your use of our service. Our maximum liability is limited to the amount you paid for the service in the 3 months prior to the claim.</p>

          <h2>9. Availability</h2>
          <p>We aim to keep the service available at all times but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of the service with reasonable notice.</p>

          <h2>10. Governing law</h2>
          <p>These terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts in Ahmedabad, Gujarat.</p>

          <h2>11. Changes to these terms</h2>
          <p>We may update these terms from time to time. Continued use of the service after changes are posted constitutes acceptance of the updated terms.</p>

          <h2>12. Contact</h2>
          <p>For questions about these terms, contact us at <a href="mailto:aamantran@plexzuu.com">aamantran@plexzuu.com</a>.</p>
        </div>
      </main>
    </>
  );
}
