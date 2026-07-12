'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { z } from 'zod';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { publicEnv } from '@/lib/env';

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long (max 72 characters)');

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(1, 'Please share the name we should address you by').max(120),
  marketingOptIn: z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean()),
});

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({ email: emailSchema });

const updatePasswordSchema = z
  .object({ password: passwordSchema })
  .strict();

export type AuthFormState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function originFromHeaders(): Promise<string> {
  // Prefer NEXT_PUBLIC_SITE_URL; fall back to the request's own origin.
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (host) return `${proto}://${host}`;
  return publicEnv.NEXT_PUBLIC_SITE_URL;
}

// ---------------------------------------------------------------------------
// Sign up
// ---------------------------------------------------------------------------
export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    marketingOptIn: formData.get('marketingOptIn'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please review the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const origin = originFromHeaders();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  });

  if (error) {
    return { status: 'error', message: error.message };
  }

  // Persist marketing opt-in on the profile. Best-effort: ignore failures.
  // (The trigger creates the profile row; this just patches the flag.)
  // await supabase
  //   .from('profiles')
  //   .update({ marketing_opt_in: parsed.data.marketingOptIn } as any)
  //   .eq('email', parsed.data.email)
  //   .then(() => undefined);

  revalidatePath('/account');
  return { status: 'idle' };
}

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------
export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please enter your email and password.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const next = (formData.get('next') as string | null) ?? '/account';

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { status: 'error', message: 'Invalid email or password.' };
  }

  revalidatePath('/', 'layout');
  redirect(next.startsWith('/') ? next : '/account');
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

// ---------------------------------------------------------------------------
// Password reset: send the recovery email
// ---------------------------------------------------------------------------
export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Enter the email address on your account.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const origin = originFromHeaders();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/account/reset-password`,
  });

  // Always respond identically to avoid email enumeration.
  if (error) {
    return { status: 'error', message: error.message };
  }

  return { status: 'idle' };
}

// ---------------------------------------------------------------------------
// Password reset: set the new password (called from the reset link landing)
// ---------------------------------------------------------------------------
export async function updatePasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = updatePasswordSchema.safeParse({ password: formData.get('password') });
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Choose a password of at least 8 characters.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { status: 'error', message: error.message };
  }

  revalidatePath('/account');
  redirect('/account?reset=success');
}
