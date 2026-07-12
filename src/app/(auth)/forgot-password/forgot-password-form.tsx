'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { AuthFormState } from '@/app/(auth)/actions';

const INITIAL: AuthFormState = { status: 'idle' };

interface ForgotPasswordFormProps {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
      {pending ? 'Sending…' : 'Send reset link'}
    </Button>
  );
}

export function ForgotPasswordForm({ action }: ForgotPasswordFormProps) {
  const [state, formAction] = useFormState(action, INITIAL);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state.status === 'error' && state.fieldErrors?.email ? (
          <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      {state.status === 'error' && !state.fieldErrors ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      {state.status === 'idle' ? (
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, we will send a reset link shortly.
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
