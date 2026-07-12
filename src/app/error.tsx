'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root error boundary. Captures unexpected render-time errors.
 * The "Try again" button re-renders the failed segment.
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Hook for future observability (Sentry, PostHog, etc.).
    // Logged locally for the foundation build.
    // eslint-disable-next-line no-console
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="container-prose flex min-h-[60vh] flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="eyebrow">Unexpected error</p>
      <h1 className="font-serif text-display-lg tracking-tight text-balance max-w-2xl">
        Something gently went off course.
      </h1>
      <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
        We have been notified. In the meantime, please try the action again or return to the home page.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Return home</Link>
        </Button>
      </div>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
      ) : null}
    </div>
  );
}
