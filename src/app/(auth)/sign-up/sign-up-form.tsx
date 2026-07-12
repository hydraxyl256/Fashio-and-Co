'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { AuthFormState } from '@/app/(auth)/actions';

const INITIAL: AuthFormState = { status: 'idle' };

interface SignUpFormProps {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
      {pending ? 'Creating account…' : children}
    </Button>
  );
}

export function SignUpForm({ action }: SignUpFormProps) {
  const [state, formAction] = useFormState(action, INITIAL);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" type="text" autoComplete="name" required />
        {state.status === 'error' && state.fieldErrors?.fullName ? (
          <p className="text-xs text-destructive">{state.fieldErrors.fullName[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state.status === 'error' && state.fieldErrors?.email ? (
          <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        {state.status === 'error' && state.fieldErrors?.password ? (
          <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 text-xs text-muted-foreground">
        <input
          type="checkbox"
          name="marketingOptIn"
          className="mt-0.5 h-4 w-4 border border-input accent-foreground"
        />
        <span>
          I would like to receive seasonal correspondence from Fashion &amp; Co. You can unsubscribe at any time.
        </span>
      </label>

      {state.status === 'error' && !state.fieldErrors ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}
