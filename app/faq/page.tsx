import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { buildPageMetadata } from '@/lib/seo';
import FaqClient from './FaqClient';
import { FAQ_CATEGORIES, faqPlainText } from './faqData';

export const metadata: Metadata = buildPageMetadata({
  title: 'FAQ — Digital Wedding Invitation Questions Answered',
  description:
    'How Aamantran works: ordering a digital wedding invitation, WhatsApp sharing, guest RSVPs, editing after going live, pricing, payments and data privacy — all answered.',
  path: '/faq',
});

const faqPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_CATEGORIES.flatMap(cat =>
    cat.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faqPlainText(faq) },
    }))
  ),
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd} />
      <FaqClient />
    </>
  );
}
