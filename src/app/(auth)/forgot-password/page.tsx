import Link from 'next/link';

import { ForgotPasswordForm } from './forgot-password-form';
import { forgotPasswordAction } from '@/app/(auth)/actions';

export const metadata = { title: 'Reset your password' };

export default function ForgotPasswordPage() {
  return (
    <section className="container-prose max-w-md py-24">
      <p className="eyebrow">Account</p>
      <h1 className="mt-3 font-serif text-display-lg tracking-tight">Reset your password.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We will email a link to set a new password.{' '}
        <Link href="/sign-in" className="link-elegant font-medium">
          Back to sign in
        </Link>
        .
      </p>

      <div className="mt-10">
        <ForgotPasswordForm action={forgotPasswordAction} />
      </div>
    </section>
  );
}
