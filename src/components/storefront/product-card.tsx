'use client';

import { useReducedMotion } from 'framer-motion';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { PriceBlock } from '@/components/storefront/price-block';
import { publicImageUrl } from '@/lib/queries/catalogue-types';
import { cn } from '@/lib/utils';
import type { ProductCardData } from '@/lib/queries/catalogue-types';

interface ProductCardProps {
  product: ProductCardData;
  /** Highlight by lifting the cover image with a brass underline. */
  emphasis?: 'subtle' | 'featured';
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export function ProductCard({
  product,
  emphasis = 'subtle',
  priority = false,
  className,
  sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw',
}: ProductCardProps) {
  const reduced = useReducedMotion();
  const href = `/products/${product.slug}`;
  const coverSrc = product.coverImage
    ? publicImageUrl(product.coverImage.storagePath)
    : null;

  return (
    <Link
      href={href}
      className={cn(
        'group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      aria-label={`${product.name}${product.coverImage?.altText ? `, ${product.coverImage.altText}` : ''}`}
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        className="space-y-4"
      >
        <div
          className={cn(
            'relative aspect-[4/5] overflow-hidden bg-muted/40',
            'transition-transform duration-600 ease-elegant group-hover:scale-[1.01]',
          )}
        >
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={product.coverImage?.altText ?? product.name}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover"
            />
          ) : (
            <PlaceholderArt label={product.name} />
          )}

          {product.compareAtPriceCents != null &&
          product.compareAtPriceCents > product.priceCents ? (
            <div className="absolute left-3 top-3">
              <Badge variant="sale">Sale</Badge>
            </div>
          ) : null}

          {emphasis === 'featured' ? (
            <div className="absolute right-3 top-3">
              <Badge variant="brass">Featured</Badge>
            </div>
          ) : null}
        </div>

        <div className="space-y-1.5">
          {product.category ? (
            <p className="eyebrow text-muted-foreground">{product.category.name}</p>
          ) : null}
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-serif text-lg leading-snug tracking-tight text-pretty">{product.name}</h3>
          </div>
          <PriceBlock
            priceCents={product.priceCents}
            compareAtPriceCents={product.compareAtPriceCents}
            currency={product.currency}
            size="sm"
          />
        </div>
      </motion.div>
    </Link>
  );
}

function PlaceholderArt({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bone-100 to-bone-200 text-muted-foreground"
    >
      <span className="font-serif text-sm tracking-[0.18em] uppercase">{label}</span>
    </div>
  );
}
