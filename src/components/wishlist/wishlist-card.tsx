'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { toast } from 'sonner';

import { toggleWishlistAction, addToCartAction } from '@/app/(storefront)/actions';

interface WishlistCardProps {
  id: string;
  slug: string;
  name: string;
  priceFormatted: string;
  imageSrc: string | null;
  defaultVariantId: string | null;
}

export function WishlistCard({ id, slug, name, priceFormatted, imageSrc, defaultVariantId }: WishlistCardProps) {
  const [removing, setRemoving] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [isRemoved, setIsRemoved] = React.useState(false);

  if (isRemoved) return null;

  const remove = async () => {
    setRemoving(true);
    try {
      const res = await toggleWishlistAction({ productId: id });
      if (res.ok) {
        setIsRemoved(true);
        toast.success('Removed from wishlist.');
      } else {
        toast.error('Could not remove item.');
      }
    } finally {
      setRemoving(false);
    }
  };

  const addToBag = async () => {
    if (!defaultVariantId) {
      toast.error('Please view product to choose options.');
      return;
    }
    
    setAdding(true);
    try {
      const res = await addToCartAction({ variantId: defaultVariantId, quantity: 1 });
      if (res.ok) toast.success('Added to bag.');
      else toast.error(res.message ?? 'Could not add to bag.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={`group flex flex-col transition-opacity ${removing ? 'opacity-50' : 'opacity-100'}`}>
      
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f2ecf0] mb-4">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}
        
        {/* Remove Button */}
        <button
          onClick={remove}
          disabled={removing}
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#4d444f] hover:text-[#d32f2f] hover:bg-white transition-all rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={`Remove ${name} from wishlist`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Details */}
      <div className="flex-1">
        <Link href={`/products/${slug}`}>
          <h3 className="font-montserrat text-[14px] font-semibold uppercase tracking-[0.05em] text-[#1d1b1e] hover:text-[#430562] transition-colors mb-1 line-clamp-1">
            {name}
          </h3>
          <p className="font-montserrat text-[16px] text-[#4d444f] mb-4">
            {priceFormatted}
          </p>
        </Link>
      </div>

      {/* Add to Bag */}
      <button
        onClick={addToBag}
        disabled={adding}
        className="w-full border border-[#430562] text-[#430562] py-3 font-montserrat text-[12px] font-semibold uppercase tracking-[0.1em] hover:bg-[#430562] hover:text-white transition-colors disabled:opacity-50"
      >
        {adding ? 'Adding...' : 'Add to Bag'}
      </button>
      
    </div>
  );
}
