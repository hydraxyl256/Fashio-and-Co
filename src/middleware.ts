import { type NextRequest, NextResponse } from 'next/server';

import { updateSupabaseSession } from '@/lib/supabase/middleware';

/**
 * Edge middleware entry. Runs on every request to refresh the Supabase session
 * and (in future steps) gate protected routes like /account and /checkout.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    // Skip Next internals, static files, and image optimizer.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
};
