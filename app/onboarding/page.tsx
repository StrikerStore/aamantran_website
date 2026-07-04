import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import OnboardingClient from './OnboardingClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Set Up Your Account',
  description: 'Create your Aamantran couple dashboard account and start customising your invitation.',
  path: '/onboarding',
  noIndex: true,
});

export default function OnboardingPage() {
  return <OnboardingClient />;
}
