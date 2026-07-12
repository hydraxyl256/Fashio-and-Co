'use client';

import { useEffect, useRef } from 'react';

import { useSession } from '@/lib/auth/session-client';
import { mergeGuestCartAction } from '@/app/(storefront)/merge-guest-cart-action';
import { clearGuestCart } from '@/lib/guest-cart';
import { toast } from 'sonner';

/**
 * Drop this into the storefront layout. When the session transitions
 * from signed-out to signed-in, merge the local guest cart into the
 * server cart.
 */
export function GuestCartMerger() {
  const session = useSession();
  const wasSignedIn = useRef<boolean>(false);

  useEffect(() => {
    const isSignedIn = !!session;
    if (isSignedIn && !wasSignedIn.current) {
      void (async () => {
        const res = await mergeGuestCartAction();
        if (res.merged > 0) {
          clearGuestCart();
          toast.success(`Merged ${res.merged} item${res.merged === 1 ? '' : 's'} from your bag.`);
        }
      })();
    }
    wasSignedIn.current = isSignedIn;
  }, [session]);

  return null;
}
