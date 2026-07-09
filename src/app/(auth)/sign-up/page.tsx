import type { Metadata } from 'next';
import { SignUpForm } from '@/components/features/auth/sign-up-form';

export const metadata: Metadata = {
  title: 'Sign Up — ECom Platform',
  description: 'Create a new account on the ECom management platform.',
};

export default function SignUpPage() {
  return <SignUpForm />;
}
