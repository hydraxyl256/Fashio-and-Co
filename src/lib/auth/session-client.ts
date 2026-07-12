'use client';

import { useEffect, useState } from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/database';

interface ClientSession {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Lightweight client-side session state. Reflects the Supabase auth
 * session on the browser; updates as the user signs in or out.
 *
 * Note: the role is fetched via a regular RLS-protected query on
 * `user_roles` — the customer is allowed to read their own role. This
 * keeps the client consistent with the server without exposing admin
 * data (the user can only ever see their own row).
 */
export function useSession(): ClientSession | null {
  const [session, setSession] = useState<ClientSession | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    async function load(userId: string, email: string) {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle<{ role: UserRole }>();
      if (cancelled) return;
      setSession({ userId, email, role: data?.role ?? 'customer' });
    }

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session?.user) {
        await load(data.session.user.id, data.session.user.email ?? '');
      } else {
        setSession(null);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (cancelled) return;
      if (newSession?.user) {
        void load(newSession.user.id, newSession.user.email ?? '');
      } else {
        setSession(null);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return session;
}
