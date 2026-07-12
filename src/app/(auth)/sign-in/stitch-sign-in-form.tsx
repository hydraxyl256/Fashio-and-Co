'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Metadata } from 'next';

import type { AuthFormState } from '@/app/(auth)/actions';

// --- Sub-components ---

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full bg-[#430562] text-white py-4 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:bg-[#3d174f] transition-colors disabled:opacity-60"
    >
      {pending ? 'Signing in…' : children}
    </button>
  );
}

interface StitchSignInFormProps {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  next?: string;
}

export function StitchSignInForm({ action, next }: StitchSignInFormProps) {
  const [state, formAction] = useActionState(action, { status: 'idle' });
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <form action={formAction} className="space-y-8">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block font-montserrat text-[12px] font-semibold uppercase tracking-wider text-[#7e7480] mb-2"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Enter your email"
          className="w-full bg-transparent border-t-0 border-x-0 border-b border-[#cfc2d1] py-3 font-montserrat text-[16px] text-[#1d1b1e] placeholder:text-[#cfc2d1] focus:outline-none focus:border-[#430562] transition-colors"
        />
        {state.status === 'error' && state.fieldErrors?.email && (
          <p className="mt-1 text-[12px] text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="flex justify-between items-end mb-2">
          <label
            htmlFor="password"
            className="font-montserrat text-[12px] font-semibold uppercase tracking-wider text-[#7e7480]"
          >
            Password
          </label>
          <a href="/forgot-password" className="font-montserrat text-[12px] text-[#430562] hover:underline">
            Forgot Password?
          </a>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full bg-transparent border-t-0 border-x-0 border-b border-[#cfc2d1] py-3 pr-10 font-montserrat text-[16px] text-[#1d1b1e] placeholder:text-[#cfc2d1] focus:outline-none focus:border-[#430562] transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[#7e7480] hover:text-[#430562] transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 10C2.5 10 5 5 10 5C15 5 17.5 10 17.5 10C17.5 10 15 15 10 15C5 15 2.5 10 2.5 10Z" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 3L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 10C2.5 10 5 5 10 5C15 5 17.5 10 17.5 10C17.5 10 15 15 10 15C5 15 2.5 10 2.5 10Z" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            )}
          </button>
        </div>
        {state.status === 'error' && state.fieldErrors?.password && (
          <p className="mt-1 text-[12px] text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      {/* Global error */}
      {state.status === 'error' && !state.fieldErrors && (
        <p role="alert" className="text-[14px] text-red-600">{state.message}</p>
      )}

      <SubmitButton>Sign In</SubmitButton>
    </form>
  );
}
