import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { buildPageMetadata } from '@/lib/seo';
import page from '../content-page.module.css';
import prose from '../prose.module.css';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description: "Aamantran's Privacy Policy — how we collect, use, and protect your personal information under India's DPDP Act.",
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className={page.page}>
      <header className={page.hero}>
        <Container>
          <p className={page.eyebrow}>Legal</p>
          <h1 className={page.title}>Privacy Policy</h1>
          <p className={page.intro}>
            What we collect, why we collect it, and what happens to your guests&rsquo; data.
          </p>
        </Container>
      </header>

      <Container>
        <div className={prose.prose}>
          <span className={prose.updated}>Last updated: 16 September 2026</span>

          <div className={prose.highlight}>
            <p><strong>The short version:</strong> We collect only what we need to run your digital e-invitation. We never sell your data. Your guest list belongs to you, always. If you try a free preview of a design with your names, we ask for no email or phone number, and what you type is deleted automatically within about a day. <strong>We do not ship physical products</strong> — our service is online only. This policy is written to comply with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the DPDP Rules, 2025.</p>
          </div>

          <h2>1. Who we are</h2>
          <p><strong>Aamantran</strong> is a brand under <strong>PLEXZUU</strong>. Aamantran (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a digital wedding invitation service operated in India. Our platform enables couples to create, customise, and share <strong>digital (e-)invitations</strong> for their weddings and events. Purchases are for online access and features only; <strong>no physical products are delivered</strong>.</p>
          <p>For the purposes of the DPDP Act, 2023, Aamantran (PLEXZUU) is the <strong>Data Fiduciary</strong> for your account, order, and website data. For guest information that you upload or collect through your invitation, we process it on your behalf and on your instructions (see Section 5).</p>
          <p>For any question about how your personal data is processed, or to exercise your rights, contact our <strong>Grievance Officer</strong> at <a href="mailto:aamantran@plexzuu.com">aamantran@plexzuu.com</a>.</p>

          <h2>2. Information we collect</h2>
          <h3>Information you provide directly</h3>
          <ul>
            <li><strong>Account information:</strong> Your username, email address, phone number, and a password (stored only as a secure cryptographic hash) when you purchase an invitation and create an account.</li>
            <li><strong>Wedding details:</strong> Names of the couple and family members, photos you upload, event dates, venue names, and ceremony details needed to create your invitation.</li>
            <li><strong>Guest information:</strong> Names, phone numbers, or email addresses of your guests if you use our guest management features. This data is provided by you and belongs to you.</li>
            <li><strong>Payment information:</strong> The amount, order reference, and the email you enter at checkout. We do <strong>not</strong> store your card, UPI, or bank details — payments are processed by third-party providers (PayU / UPI) and are subject to their privacy policies.</li>
            <li><strong>Communications:</strong> Messages you send us via WhatsApp, email, our contact form, or support tickets raised from your dashboard.</li>
          </ul>

          <h3>Information you give us for a free preview</h3>
          <p>You can see a design filled in with your own details before buying, without an account and without paying. For this we ask for:</p>
          <ul>
            <li>the names to show on the invitation — the ones the design asks for, at most three;</li>
            <li>the date of the celebration;</li>
            <li>the venue name and, if you choose to give it, the city;</li>
            <li>the ceremonies or events you want to see, with their dates and, if you choose, their times;</li>
            <li>the design you are previewing.</li>
          </ul>
          <p>We do <strong>not</strong> ask for your email address, phone number or any other way to contact you, and a preview is not linked to any account. Please use only names you are entitled to share — normally your own, your partner&apos;s or your family&apos;s.</p>
          <p>We use these details <strong>only</strong> to show you the preview. The preview link works for <strong>15 minutes</strong>. Anyone you send the link to can see the names and dates on it during that time, so share it only with people you are happy to show them to. The page is marked so search engines do not index it.</p>
          <p>If you buy the design from that preview, we use the same details to fill in your new invitation so you do not have to type them again; you can change them in the builder before you confirm them.</p>
          <p>To stop one connection creating an unreasonable number of previews, we also keep a <strong>one-way, salted hash of your IP address</strong> — a scrambled value that cannot practically be turned back into the address. We never store the address itself. The hash is deleted along with the preview.</p>

          <h3>Information collected automatically</h3>
          <ul>
            <li><strong>Website analytics:</strong> On our marketing website we use first-party, cookie-less analytics: an anonymous session identifier, pages visited, referrer website, device type, browser, and approximate location (country/state level). No IP address is stored and this data is not linked to your identity.</li>
            <li><strong>Invitation activity (shown to the host):</strong> When a guest opens an invitation link or submits an RSVP, we record that activity — including which guest&apos;s personal link was used — so that the host can see who has viewed the invitation and who has responded. This information is visible only to the event host and to us; it is never used for advertising or profiling.</li>
            <li><strong>RSVP responses and wishes:</strong> When a guest submits an RSVP or a wish, we record their response, name, meal preference, and message as entered by them, and show it to the event host.</li>
            <li><strong>Security logs:</strong> We keep logs of login and account-recovery activity to detect and investigate unauthorised access.</li>
          </ul>

          <h2>3. How we use your information</h2>
          <p>We use the information we collect only for the following specified purposes:</p>
          <ul>
            <li>Design, build, host, and deliver your digital invitation.</li>
            <li>Show you a free, temporary preview of a design with the names and dates you enter, and — only if you then buy it — fill your new invitation in with them.</li>
            <li>Send you your invitation link and important transactional updates related to your order (order confirmation, onboarding, RSVP milestones, event reminders).</li>
            <li>Provide you with your RSVP dashboard and guest management tools.</li>
            <li>Process payments and maintain records required under Indian tax law.</li>
            <li>Respond to your questions, grievances, and support requests.</li>
            <li>Keep the platform secure and prevent fraud and abuse.</li>
            <li>Improve our templates, features, and overall service quality (using aggregated, de-identified data).</li>
          </ul>
          <p>We do not send marketing emails without your consent, and we never sell your data.</p>

          <h2>4. Consent and how to withdraw it</h2>
          <p>We process your personal data on the basis of the consent you give when you purchase an invitation and create an account, and — for certain uses such as processing your payment and honouring your purchase — as a legitimate use permitted under the DPDP Act.</p>
          <p>You may <strong>withdraw your consent at any time</strong>, with the same ease with which you gave it, by emailing <a href="mailto:aamantran@plexzuu.com">aamantran@plexzuu.com</a> from your registered email address. On withdrawal we will stop the related processing and delete the related personal data, except where we are required by law to retain it (for example, payment records under tax law). Withdrawing consent may mean we can no longer provide the service — for example, your invitation may need to be taken offline.</p>
          <p><strong>Free previews:</strong> you give consent by submitting the preview form, which tells you what is collected and for how long before you submit. You do not need to do anything to withdraw it — the details delete themselves within about a day. If you want them gone sooner, email <a href="mailto:aamantran@plexzuu.com">aamantran@plexzuu.com</a> with the preview link and we will delete them.</p>

          <h2>5. Guest data — your household use, our processing</h2>
          <p>Guest information (names, contact details, RSVP responses, wishes) uploaded or collected through your invitation is your data, shared by you for your personal and family event. We act as a processor of this data on your behalf and on your instructions. Specifically:</p>
          <ul>
            <li>We do not contact your guests for any purpose other than delivering the invitation and RSVP experience you have set up.</li>
            <li>We do not use guest data for marketing, advertising, or third-party profiling.</li>
            <li>Invitation-open and RSVP activity for each guest is shown only to you, the event host (see Section 2).</li>
            <li>By uploading guest details, you confirm you are entitled to share them with us for the purpose of managing your event.</li>
            <li>You can export your guest data at any time from your dashboard, and can request its deletion at any time by emailing us.</li>
          </ul>

          <h2>6. How long we keep your data</h2>
          <ul>
            <li><strong>Guest data (guest list, RSVPs, wishes, per-guest invitation activity):</strong> automatically deleted <strong>90 days after your invitation expires</strong> (your invitation expires shortly after your last event date). We will email you at least <strong>48 hours before deletion</strong> so you can export your guest list and RSVP report if you wish to keep it. Aggregate counts (for example, total RSVPs) may be retained.</li>
            <li><strong>Free previews (names, dates, venue, ceremonies and the IP hash):</strong> the link stops working after 15 minutes, and everything is <strong>deleted automatically about 24 hours after you create the preview</strong>, whether or not you buy. If you do buy, the details already copied into your invitation are then kept as invitation content, below.</li>
            <li><strong>Account and invitation content:</strong> retained while your account is active, and deleted when you ask us to delete your account.</li>
            <li><strong>Payment records:</strong> retained for the period required by Indian tax and accounting law, even after account deletion, in de-linked form where possible.</li>
            <li><strong>Website analytics:</strong> raw event data is deleted after 90 days; only aggregated daily statistics are kept.</li>
            <li><strong>Security logs:</strong> retained for at least one year, as required by the DPDP Rules, 2025.</li>
          </ul>

          <h2>7. Data sharing</h2>
          <p>We do not sell, rent, or trade your personal information. We share data only in these limited circumstances:</p>
          <ul>
            <li><strong>Service providers (Data Processors):</strong> We work with trusted third-party services — cloud hosting, media storage (Cloudflare), payment processing (PayU), and email delivery — who handle data only as needed to provide their services and are contractually bound to protect it with reasonable security safeguards.</li>
            <li><strong>Legal requirements:</strong> We may disclose data if required by law, court order, or a lawful request from a government authority, or to protect the rights and safety of our users or the public.</li>
            <li><strong>Advertising measurement (with your consent only):</strong> If you accept advertising cookies, the Meta Pixel shares your website interactions with Meta — see Section 14.</li>
          </ul>

          <h2>8. Where your data is stored</h2>
          <p>Our primary database is hosted in India. Some of our service providers (such as our content-delivery and media-storage provider) operate global infrastructure, so copies of uploaded media and cached content may be stored or served from outside India. Any such transfer is carried out in accordance with the DPDP Act and any restrictions notified by the Central Government, and our providers are bound to protect your data wherever it is processed.</p>

          <h2>9. Your rights under the DPDP Act</h2>
          <p>As a Data Principal under the DPDP Act, 2023, you have the right to:</p>
          <ul>
            <li><strong>Access:</strong> obtain a summary of the personal data we hold about you and how it is processed.</li>
            <li><strong>Correction and updating:</strong> correct inaccurate or incomplete data — most of it directly from your dashboard.</li>
            <li><strong>Erasure:</strong> ask us to delete your personal data, subject to legal retention requirements.</li>
            <li><strong>Withdraw consent:</strong> at any time, as described in Section 4.</li>
            <li><strong>Nominate:</strong> nominate another individual to exercise your rights on your behalf in the event of your death or incapacity. Email us to record a nominee.</li>
            <li><strong>Grievance redressal:</strong> raise a complaint with us about how your data is handled (see Section 10).</li>
          </ul>
          <p>To exercise any of these rights, email <a href="mailto:aamantran@plexzuu.com">aamantran@plexzuu.com</a> <strong>from your registered email address</strong>, mentioning your username so we can verify your identity.</p>

          <h2>10. Grievance redressal and complaints</h2>
          <p>If you have a concern about how your personal data is handled, contact our Grievance Officer at <a href="mailto:aamantran@plexzuu.com">aamantran@plexzuu.com</a>. We will acknowledge your grievance within <strong>7 business days</strong> and resolve it within <strong>30 days</strong> — well within the 90-day period prescribed under the DPDP Rules, 2025.</p>
          <p>If you are not satisfied with our response after exhausting this process, you have the right to file a complaint with the <strong>Data Protection Board of India</strong>, which functions as a digital office and accepts complaints online.</p>

          <h2>11. Children</h2>
          <p>Our service is intended for adults. You must be at least 18 years old to purchase an invitation or create an account. Guest lists uploaded by hosts may incidentally include the names of minors (for example, family members); this data is provided by the host for their personal event, is never used by us for tracking, behavioural monitoring, or advertising, and is deleted on the schedule in Section 6.</p>

          <h2>12. How we protect your data</h2>
          <p>We take reasonable security safeguards as required by the DPDP Act and Rules, including: encryption of data in transit (HTTPS), passwords stored only as strong one-way hashes, role-based access controls with two-factor authentication for administrative access, rate limiting, security event logging and monitoring, and regular data backups.</p>

          <h2>13. Data breach notification</h2>
          <p>In the unlikely event of a personal data breach affecting you, we will inform you without delay through your registered email — describing what happened, the likely consequences, what we are doing about it, and what you can do to protect yourself — and will report the breach to the Data Protection Board of India within the timelines prescribed under the DPDP Rules, 2025.</p>

          <h2>14. Cookies and advertising pixels</h2>
          <p><strong>Essential cookies:</strong> the platform uses only the cookies needed to function (session management, authentication). Our own website analytics are cookie-less and anonymous.</p>
          <p><strong>Advertising (Meta Pixel) — only with your consent:</strong> on our marketing website we use the Meta (Facebook) Pixel to measure the effectiveness of our advertising. The Pixel sets third-party cookies and shares your interactions with our site (such as pages viewed and purchases) with Meta, whose use of this data is described in <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">Meta&apos;s Privacy Policy</a>. The Pixel is <strong>never loaded unless you click &quot;Accept&quot;</strong> in our cookie banner. If you decline, no advertising cookies are set. You can change your choice at any time using the <strong>&quot;Cookie Preferences&quot;</strong> link in the website footer — withdrawing is as easy as accepting. The Pixel is not used on invitation pages viewed by your guests.</p>

          <h2>15. Changes to this policy</h2>
          <p>We may update this policy from time to time. If we make significant changes, we will notify you by email or by placing a prominent notice on our website. The date at the top of this page indicates the most recent revision.</p>

          <h2>16. Contact us</h2>
          <p>If you have any questions about this Privacy Policy or how we handle your data, please contact our Grievance Officer at <a href="mailto:aamantran@plexzuu.com">aamantran@plexzuu.com</a>.</p>
        </div>
      </Container>
    </div>
  );
}
