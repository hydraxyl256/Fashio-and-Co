import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { publicImageUrl } from '@/lib/queries/catalogue-types';
import { cn } from '@/lib/utils';

interface EditorialSplitProps {
  eyebrow: string;
  title: string;
  body: string;
  imagePath: string;
  href: string;
  ctaLabel: string;
  align?: 'left' | 'right';
  className?: string;
}

export function EditorialSplit({
  eyebrow,
  title,
  body,
  imagePath,
  href,
  ctaLabel,
  align = 'left',
  className,
}: EditorialSplitProps) {
  const imageUrl = publicImageUrl(imagePath, 'collection-images');
  return (
    <section className={cn('container-prose py-section-sm', className)}>
      <div
        className={cn(
          'grid grid-cols-1 items-center gap-10 lg:gap-16',
          align === 'right' ? 'lg:grid-cols-[1.1fr_1fr]' : 'lg:grid-cols-[1fr_1.1fr]',
        )}
      >
        <div className={cn('relative aspect-[4/5] overflow-hidden bg-muted', align === 'right' && 'lg:order-2')}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bone-100 text-muted-foreground">
              {title}
            </div>
          )}
        </div>

        <div className={cn('max-w-xl', align === 'right' && 'lg:order-1')}>
          <Badge variant="outline" className="mb-4">
            {eyebrow}
          </Badge>
          <h2 className="font-serif text-display-lg tracking-tight text-balance">{title}</h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed text-pretty">{body}</p>
          <Link
            href={href}
            className="mt-8 inline-flex items-center gap-2 text-eyebrow uppercase tracking-[0.2em] text-foreground transition-colors hover:text-accent"
          >
            {ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
