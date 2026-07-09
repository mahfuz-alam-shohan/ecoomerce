
import type { Metadata } from 'next';
import { SignInForm } from '@/components/features/auth/sign-in-form';

export const metadata: Metadata = {
  title: 'Sign In — ECom Platform',
  description: 'Sign in to your store management dashboard.',
};

export default function SignInPage() {
  return <SignInForm />;
}
