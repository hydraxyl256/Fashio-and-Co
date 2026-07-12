import Image from 'next/image';
import Link from 'next/link';

import { formatCurrency } from '@/lib/format';
import { publicImageUrl } from '@/lib/queries/catalogue-types';
import { cn } from '@/lib/utils';

interface PriceBlockProps {
  priceCents: number;
  compareAtPriceCents?: number | null;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceBlock({
  priceCents,
  compareAtPriceCents,
  currency = 'KES',
  size = 'md',
  className,
}: PriceBlockProps) {
  const onSale = compareAtPriceCents != null && compareAtPriceCents > priceCents;
  const sizeClass = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <div className={cn('flex items-baseline gap-3', className)}>
      <span className={cn('font-sans font-medium', sizeClass)}>
        {formatCurrency(priceCents, { currency })}
      </span>
      {onSale ? (
        <span className={cn('text-muted-foreground line-through', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {formatCurrency(compareAtPriceCents, { currency })}
        </span>
      ) : null}
    </div>
  );
}
