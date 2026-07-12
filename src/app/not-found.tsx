import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container-prose flex min-h-[60vh] flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="font-serif text-display-lg tracking-tight text-balance max-w-2xl">
        This piece is not in the collection.
      </h1>
      <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
        The page you were looking for has either moved or never existed. Return to the home page to continue browsing.
      </p>
      <Button asChild>
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
