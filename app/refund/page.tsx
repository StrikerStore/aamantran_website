import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy — Aamantran',
  description: "Aamantran's Refund Policy — clear, fair, and straightforward. Know your options before you purchase.",
};

export default function RefundPage() {
  return (
    <>
      <section className="page-hero">
        <span className="page-eyebrow">Legal</span>
        <h1 className="page-title">Refund <em>Policy</em></h1>
        <p className="page-subtitle">We want you to be completely happy. Here&apos;s our straightforward, no-nonsense approach to refunds and cancellations.</p>
      </section>

      <main className="page-body">
        <div className="prose">
          <span className="last-updated">Last updated: 5 April 2026</span>

          <div className="highlight-box">
            <p><strong>Summary:</strong> Aamantran sells <strong>digital e-invitations only</strong> — no printed cards or physical goods are shipped. We offer full refunds before work begins. Once your invitation is live and you&apos;ve received your link, refunds are not available — but we&apos;ll always make it right if something is our fault.</p>
          </div>

          <h2>1. Eligibility for refund</h2>
          <p>You are eligible for a full refund in the following situations:</p>
          <ul>
            <li>You have not yet received your invitation link, and it has been more than 48 hours since payment.</li>
            <li>Your invitation was delivered with a significant error that is our fault and we are unable to correct it within 24 hours of being notified.</li>
            <li>You have contacted us within 2 hours of payment and the invitation setup has not yet started.</li>
          </ul>

          <h2>2. No-refund situations</h2>
          <p>Refunds are not issued in the following cases:</p>
          <ul>
            <li>Your invitation has been delivered and is live (the link has been sent to you).</li>
            <li>You have changed your mind about the design after the invitation is live.</li>
            <li>The details you provided were incorrect and we created the invitation based on those details.</li>
            <li>You no longer need the invitation (e.g., event cancelled or postponed) — we can update dates and details for free.</li>
            <li>More than 48 hours have passed since the invitation was delivered.</li>
          </ul>

          <h2>3. How to request a refund</h2>
          <p>To request a refund, contact us via:</p>
          <ul>
            <li>WhatsApp: send a message to our WhatsApp number mentioning your order ID and reason for refund.</li>
            <li>Email: <a href="mailto:aamantran@plexzuu.com">aamantran@plexzuu.com</a> with subject line &quot;Refund Request — [Your Name]&quot;</li>
          </ul>
          <p>We will review your request within 1 business day and, if approved, process the refund to your original payment method within 5–7 business days.</p>

          <h2>4. Partial refunds</h2>
          <p>In certain cases where partial work has been completed, we may offer a partial refund at our discretion. We will always communicate clearly about what is being refunded and why.</p>

          <h2>5. Changes and upgrades</h2>
          <p>If you wish to upgrade your plan after purchase, you only pay the difference. Downgrades are not eligible for partial refunds after the invitation is live.</p>

          <h2>6. Questions</h2>
          <p>If you&apos;re unsure about anything, please reach out before purchasing. We&apos;re happy to answer questions and help you choose the right option. Contact us at <a href="mailto:aamantran@plexzuu.com">aamantran@plexzuu.com</a>.</p>
        </div>
      </main>
    </>
  );
}
