import 'server-only';

import { redirect } from 'next/navigation';
import { cache } from 'react';
import type { User } from '@supabase/supabase-js';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database, UserRole } from '@/types/database';

/**
 * Lightweight shape we trust for the rest of the app. The full Supabase
 * `User` is intentionally not exposed outside server code.
 */
export interface AuthSession {
  user: User;
  role: UserRole;
  email: string;
}

async function loadSession(): Promise<AuthSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle<{ role: UserRole }>();

  return {
    user,
    role: roleRow?.role ?? 'customer',
    email: user.email ?? '',
  };
}

/**
 * Memoized per-request session resolver. Use inside Server Components,
 * Server Actions, and Route Handlers.
 */
export const getSession = cache(loadSession);

/**
 * Require an authenticated user. Redirects to /sign-in otherwise, with a
 * `next` param to land back here on success.
 */
export async function requireUser(redirectTo: string = '/'): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    const next = encodeURIComponent(redirectTo);
    redirect(`/sign-in?next=${next}`);
  }
  return session;
}

/**
 * Require a staff or admin role. Used by /admin and /staff dashboards.
 */
export async function requireStaffOrAdmin(redirectTo: string = '/'): Promise<AuthSession> {
  const session = await requireUser(redirectTo);
  if (session.role !== 'staff' && session.role !== 'admin') {
    redirect('/account');
  }
  return session;
}

/**
 * Require an admin role. Used by the most sensitive admin pages
 * (audit logs, role management).
 */
export async function requireAdmin(redirectTo: string = '/'): Promise<AuthSession> {
  const session = await requireUser(redirectTo);
  if (session.role !== 'admin') {
    redirect('/admin');
  }
  return session;
}

/**
 * Convenience for typed profile fetches inside Server Components.
 */
export async function getProfile(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data as Database['public']['Tables']['profiles']['Row'] | null;
}
