import { NextResponse, type NextRequest } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Supabase email confirmation / magic-link landing.
 *
 * Supabase appends a `code` query param when the user clicks the email link.
 * We exchange it for a session cookie and then route to `next` (or /account).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/account';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // Surface an error rather than silently dropping the user.
  return NextResponse.redirect(new URL('/sign-in?error=auth-callback-failed', origin));
}
