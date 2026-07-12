'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { publicImageUrl } from '@/lib/queries/catalogue-types';
import { cn } from '@/lib/utils';

interface EditorialHeroProps {
  eyebrow?: string | null;
  title: string;
  body?: string | null;
  imagePath?: string | null;
  bucket?: 'campaign-images' | 'collection-images';
  ctaLabel?: string | null;
  ctaHref?: string | null;
  secondaryLabel?: string | null;
  secondaryHref?: string | null;
}

export function EditorialHero({
  eyebrow,
  title,
  body,
  imagePath,
  bucket = 'campaign-images',
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
}: EditorialHeroProps) {
  const reduced = useReducedMotion();
  const imageUrl = imagePath ? publicImageUrl(imagePath, bucket) : null;

  return (
    <section className="relative isolate overflow-hidden bg-bone-100">
      <div className="container-prose relative grid min-h-[80vh] grid-cols-1 items-center gap-12 py-24 lg:min-h-[88vh] lg:grid-cols-12 lg:gap-16 lg:py-32">
        {/* Copy column */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
          className="lg:col-span-6 lg:pr-8"
        >
          {eyebrow ? (
            <Badge variant="brass" className="mb-6">
              {eyebrow}
            </Badge>
          ) : null}

          <h1 className="font-serif text-display-2xl text-balance text-foreground">
            {title}
          </h1>

          {body ? (
            <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed text-pretty">
              {body}
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            {ctaLabel && ctaHref ? (
              <Button asChild size="lg">
                <Link href={ctaHref}>
                  {ctaLabel} <ArrowRight aria-hidden />
                </Link>
              </Button>
            ) : null}
            {secondaryLabel && secondaryHref ? (
              <Button variant="ghost" size="lg" asChild>
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            ) : null}
          </div>
        </motion.div>

        {/* Imagery column */}
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative aspect-[4/5] w-full overflow-hidden bg-muted lg:col-span-6 lg:aspect-[3/4]"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bone-100 via-bone-200 to-bone-50 font-serif text-sm uppercase tracking-[0.18em] text-muted-foreground"
              aria-hidden
            >
              Editorial image
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export function SectionHeader({ eyebrow, title, body, ctaLabel, ctaHref, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="mt-2 font-serif text-display-lg tracking-tight text-balance">{title}</h2>
        {body ? (
          <p className="mt-3 max-w-xl text-sm text-muted-foreground leading-relaxed text-pretty">{body}</p>
        ) : null}
      </div>
      {ctaLabel && ctaHref ? (
        <Button variant="ghost" asChild className="self-start sm:self-auto">
          <Link href={ctaHref}>
            {ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
