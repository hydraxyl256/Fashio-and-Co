import Link from 'next/link';

import { SignUpForm } from './sign-up-form';
import { signUpAction } from '@/app/(auth)/actions';

export const metadata = { title: 'Create account' };

export default function SignUpPage() {
  return (
    <section className="container-prose max-w-md py-24">
      <p className="eyebrow">New here</p>
      <h1 className="mt-3 font-serif text-display-lg tracking-tight">Create an account.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Already with us?{' '}
        <Link href="/sign-in" className="link-elegant font-medium">
          Sign in
        </Link>
        .
      </p>

      <div className="mt-10">
        <SignUpForm action={signUpAction} />
      </div>
    </section>
  );
}
