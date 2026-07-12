import Link from 'next/link';

import { ResetPasswordForm } from './reset-password-form';
import { updatePasswordAction } from '@/app/(auth)/actions';

export const metadata = { title: 'Set a new password' };

export default function ResetPasswordPage() {
  return (
    <section className="container-prose max-w-md py-24">
      <p className="eyebrow">Account</p>
      <h1 className="mt-3 font-serif text-display-lg tracking-tight">Set a new password.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose a strong password you have not used elsewhere.{' '}
        <Link href="/sign-in" className="link-elegant font-medium">
          Back to sign in
        </Link>
        .
      </p>

      <div className="mt-10">
        <ResetPasswordForm action={updatePasswordAction} />
      </div>
    </section>
  );
}
