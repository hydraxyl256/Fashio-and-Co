'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { AuthFormState } from '@/app/(auth)/actions';

const INITIAL: AuthFormState = { status: 'idle' };

interface ResetPasswordFormProps {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
      {pending ? 'Updating…' : 'Set new password'}
    </Button>
  );
}

export function ResetPasswordForm({ action }: ResetPasswordFormProps) {
  const [state, formAction] = useFormState(action, INITIAL);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
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

      {state.status === 'error' && !state.fieldErrors ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
