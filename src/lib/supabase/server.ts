import { cookies } from 'next/headers';

import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

import { publicEnv } from '@/lib/env';

/**
 * Server-side Supabase client bound to the current request's cookies.
 * Use inside Server Components, Server Actions, and Route Handlers.
 *
 * NOTE: this client honors Row Level Security. It does NOT have admin rights.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<any>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // `set` was called from a Server Component without access to mutate cookies.
            // Safe to ignore when middleware is refreshing user sessions.
          }
        },
      },
    },
  );
}
