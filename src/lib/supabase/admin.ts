import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Server-only Supabase client that bypasses Row Level Security.
 * Use ONLY in trusted server contexts (admin jobs, webhooks, server actions).
 * Never import this from a Client Component.
 */
export async function createSupabaseServiceRoleClient(): Promise<
  SupabaseClient<Database>
> {
  const { serverEnv } = await import('@/lib/env');
  const { createClient } = await import('@supabase/supabase-js');

  return createClient<Database>(serverEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
