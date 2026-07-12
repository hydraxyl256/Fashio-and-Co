'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { AuthFormState } from '@/app/(auth)/actions';

const INITIAL: AuthFormState = { status: 'idle' };

interface SignInFormProps {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  next?: string;
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
      {pending ? 'Signing in…' : children}
    </Button>
  );
}

export function SignInForm({ action, next }: SignInFormProps) {
  const [state, formAction] = useFormState(action, INITIAL);

  return (
    <form action={formAction} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state.status === 'error' && state.fieldErrors?.email ? (
          <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="/forgot-password" className="link-elegant text-xs">
            Forgot?
          </a>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {state.status === 'error' && state.fieldErrors?.password ? (
          <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>

      {state.status === 'error' && !state.fieldErrors ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <SubmitButton>Sign in</SubmitButton>
    </form>
  );
}
