import { z } from 'zod';

/**
 * Environment variable schema.
 *
 * We split into two schemas:
 *  - `publicEnvSchema` for variables safe to ship to the browser (must be prefixed
 *    with `NEXT_PUBLIC_`).
 *  - `serverEnvSchema` for secrets and server-only configuration.
 *
 * Server-only values MUST NEVER be read in client code. Import `env` from this
 * module only in server contexts (route handlers, server components, edge fns).
 */

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(20, 'NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be missing'),
  NEXT_PUBLIC_SITE_URL: z.string().url('NEXT_PUBLIC_SITE_URL must be a valid URL'),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(20, 'SUPABASE_SERVICE_ROLE_KEY appears to be missing'),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required for transactional email'),
  RESEND_FROM_EMAIL: z.string().email('RESEND_FROM_EMAIL must be a valid email address'),
  PESAPAL_CONSUMER_KEY: z.string().min(1, 'PESAPAL_CONSUMER_KEY is required for payments'),
  PESAPAL_CONSUMER_SECRET: z
    .string()
    .min(1, 'PESAPAL_CONSUMER_SECRET is required for payments'),
  PESAPAL_CALLBACK_URL: z.string().url('PESAPAL_CALLBACK_URL must be a valid URL'),
});

/**
 * Public environment, safe to import from client components.
 */
export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

/**
 * Server-only environment. Throws on import if any required variable is missing.
 * Use inside Server Components, Route Handlers, Server Actions, and Edge Functions.
 */
export const serverEnv =
  typeof window === 'undefined'
    ? serverEnvSchema.parse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
        PESAPAL_CONSUMER_KEY: process.env.PESAPAL_CONSUMER_KEY,
        PESAPAL_CONSUMER_SECRET: process.env.PESAPAL_CONSUMER_SECRET,
        PESAPAL_CALLBACK_URL: process.env.PESAPAL_CALLBACK_URL,
      })
    : (publicEnv as unknown as z.infer<typeof serverEnvSchema>);

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
