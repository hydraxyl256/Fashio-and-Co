'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

import { publicEnv } from '@/lib/env';

/**
 * Browser-side Supabase client. Use inside Client Components and event handlers.
 * Session storage defaults to cookies for SSR compatibility.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<any>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
