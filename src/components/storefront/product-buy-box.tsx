'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';

import { addToCartAction, toggleWishlistAction } from '@/app/(storefront)/actions';
import { addToGuestCart } from '@/lib/guest-cart';
import { useSession } from '@/lib/auth/session-client';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';

export interface PdpVariant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  material: string | null;
  metal: string | null;
  gemstone: string | null;
  ringSize: string | null;
  chainLengthCm: number | null;
  stockQuantity: number;
  reservedQuantity: number;
  priceOverrideCents: number | null;
  compareAtPriceCents: number | null;
  isActive: boolean;
}

export interface PdpProduct {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  fullDescription: string | null;
  categoryId: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  careInstructions: string | null;
  fitNotes: string | null;
  coverImage?: string | null;
}

interface ProductBuyBoxProps {
  product: PdpProduct;
  variants: PdpVariant[];
  initiallyWished: boolean;
  sizeGuide?: { title: string; body: string } | null;
}

const SIZES_ORDER = ['XS', 'S', 'M', 'L', 'XL'];
const GEMSTONE_COLORS: Record<string, string> = {
  'Onyx': '#1d1b1e',
  'Pearl': '#fef8fc',
  'Amethyst': '#e6b4ff',
  'Emerald': '#059669',
  'Sapphire': '#1e3a8a',
  'Ruby': '#991b1b',
};

function pickDefaultSize(variants: PdpVariant[]): string | null {
  const sizes = Array.from(new Set(variants.filter(v => v.isActive).map(v => v.size).filter((s): s is string => !!s)));
  for (const s of SIZES_ORDER) if (sizes.includes(s)) return s;
  return sizes[0] ?? null;
}

function pickDefaultChainLength(variants: PdpVariant[]): number | null {
  const lengths = Array.from(new Set(variants.filter(v => v.isActive).map(v => v.chainLengthCm).filter((l): l is number => l != null)));
  return lengths.sort((a, b) => a - b)[0] ?? null;
}

export function ProductBuyBox({ product, variants, initiallyWished, sizeGuide }: ProductBuyBoxProps) {
  const reduced = useReducedMotion();
  const session = useSession();
  
  // State
  const [size, setSize] = React.useState<string | null>(pickDefaultSize(variants));
  const [chainLength, setChainLength] = React.useState<number | null>(pickDefaultChainLength(variants));
  const [gemstone, setGemstone] = React.useState<string | null>(null);
  
  const [wished, setWished] = React.useState(initiallyWished);
  const [submitting, setSubmitting] = React.useState(false);

  // Accordion state
  const [openSection, setOpenSection] = React.useState<string>('details');

  // Variant options
  const allSizes = Array.from(new Set(variants.filter(v => v.isActive).map(v => v.size).filter((s): s is string => !!s)));
  const allChainLengths = Array.from(new Set(variants.filter(v => v.isActive).map(v => v.chainLengthCm).filter((l): l is number => l != null))).sort((a, b) => a - b);
  const allGemstones = Array.from(new Set(variants.filter(v => v.isActive).map(v => v.gemstone).filter((g): g is string => !!g)));

  React.useEffect(() => {
    if (allGemstones.length > 0 && !gemstone) setGemstone(allGemstones[0] ?? null);
  }, [allGemstones, gemstone]);

  const selectedVariant = React.useMemo(() => {
    return variants.find(
      (v) =>
        v.isActive &&
        (allSizes.length === 0 || v.size === size) &&
        (allChainLengths.length === 0 || v.chainLengthCm === chainLength) &&
        (allGemstones.length === 0 || v.gemstone === gemstone)
    );
  }, [variants, size, chainLength, gemstone, allSizes, allChainLengths, allGemstones]);

  const unitPrice = selectedVariant?.priceOverrideCents ?? product.priceCents;
  const priceFormatted = new Intl.NumberFormat('en-KE', { style: 'currency', currency: product.currency, minimumFractionDigits: 0 }).format(unitPrice / 100);

  const available = selectedVariant ? Math.max(0, selectedVariant.stockQuantity - selectedVariant.reservedQuantity) : 0;
  const inStock = available > 0;

  const router = useRouter();
  const optimisticAdd = useCartStore(s => s.optimisticAdd);
  const rollback = useCartStore(s => s.rollback);
  const currentCart = useCartStore(s => s.cart);

  const onAdd = async () => {
    if (!selectedVariant) {
      toast.error('Please choose your options.');
      return;
    }
    setSubmitting(true);
    const prevCart = currentCart;
    const optimisticItem = {
      id: `temp-${Date.now()}`,
      variantId: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantTitle: [selectedVariant.color, selectedVariant.size, selectedVariant.metal, selectedVariant.gemstone, selectedVariant.ringSize, selectedVariant.chainLengthCm ? `${selectedVariant.chainLengthCm}cm` : null].filter(Boolean).join(' / ') || null,
      size: selectedVariant.size,
      color: selectedVariant.color,
      metal: selectedVariant.metal,
      sku: selectedVariant.sku,
      imagePath: product.coverImage ?? null,
      quantity: 1,
      unitPriceCents: unitPrice,
      lineTotalCents: unitPrice,
      currency: product.currency,
      available: available,
    };

    optimisticAdd(optimisticItem);

    try {
      if (!session) {
        addToGuestCart(selectedVariant.id, 1);
        toast.success(`${product.name} added to your bag.`);
        router.refresh();
        return;
      }
      const res = await addToCartAction({ variantId: selectedVariant.id, quantity: 1 });
      if (res.ok) {
        toast.success(`${product.name} added to your bag.`);
        // Note: we don't need router.refresh() anymore because layout will re-sync or we could just trust the optimistic UI, 
        // but router.refresh() ensures the server state is re-fetched and `CartStoreInitializer` will update the store.
        router.refresh(); 
      }
      else {
        toast.error(res.message ?? 'Could not add to bag');
        rollback(prevCart);
      }
    } catch (e) {
      toast.error('Network error');
      rollback(prevCart);
    } finally {
      setSubmitting(false);
    }
  };

  const onWish = async () => {
    setWished(p => !p);
    const res = await toggleWishlistAction({ productId: product.id });
    if (!res.ok) {
      setWished(p => !p);
      toast.error('Sign in to save pieces to your wishlist.');
      return;
    }
    toast.success(res.added ? 'Saved to wishlist.' : 'Removed from wishlist.');
  };

  const toggleSection = (id: string) => {
    setOpenSection(prev => prev === id ? '' : id);
  };

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      className="bg-white p-8 lg:p-10 shadow-sm"
    >
      {/* Header */}
      <div className="mb-8">
        <span className="font-montserrat text-[12px] font-medium uppercase tracking-[0.12em] text-[#775a1a]">
          {product.shortDescription || 'Exclusive Collection'}
        </span>
        <h1 className="font-playfair text-[32px] md:text-[40px] font-bold leading-[1.1] text-[#430562] mt-2 mb-4">
          {product.name}
        </h1>
        
        <div className="flex items-center gap-4">
          <span className="font-montserrat text-[24px] text-[#775a1a]">
            {priceFormatted}
          </span>
        </div>
        <div className="w-full h-px bg-[#cfc2d1]/50 my-6" />
        
        {product.fullDescription && (
          <p className="font-montserrat text-[16px] leading-[28px] text-[#4d444f]">
            {product.fullDescription}
          </p>
        )}
      </div>

      {/* Selectors */}
      <div className="space-y-6 mb-8">
        
        {/* Size (Clothing) */}
        {allSizes.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-montserrat text-[14px] font-semibold uppercase tracking-wider text-[#430562]">
                Size
              </span>
              {sizeGuide && (
                <button type="button" className="font-montserrat text-[12px] uppercase tracking-wider text-[#775a1a] hover:opacity-70 transition-opacity">
                  Size Guide
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {allSizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-12 h-12 flex items-center justify-center font-montserrat text-[14px] border transition-colors ${
                    size === s 
                      ? 'bg-[#430562] text-white border-[#430562]' 
                      : 'border-[#cfc2d1] text-[#4d444f] hover:border-[#430562] hover:text-[#430562]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chain Length (Jewelry) */}
        {allChainLengths.length > 0 && (
          <div>
            <span className="block font-montserrat text-[14px] font-semibold uppercase tracking-wider text-[#430562] mb-3">
              Chain Length
            </span>
            <div className="flex flex-wrap gap-3">
              {allChainLengths.map(l => (
                <button
                  key={l}
                  onClick={() => setChainLength(l)}
                  className={`px-4 py-3 min-w-[3rem] font-montserrat text-[14px] border transition-colors ${
                    chainLength === l 
                      ? 'bg-[#430562] text-white border-[#430562]' 
                      : 'border-[#cfc2d1] text-[#4d444f] hover:border-[#430562] hover:text-[#430562]'
                  }`}
                >
                  {l} cm
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gemstone (Jewelry) */}
        {allGemstones.length > 0 && (
          <div>
            <span className="block font-montserrat text-[14px] font-semibold uppercase tracking-wider text-[#430562] mb-3">
              Gemstone <span className="text-[#4d444f] font-normal lowercase capitalize pl-2">— {gemstone}</span>
            </span>
            <div className="flex flex-wrap gap-3">
              {allGemstones.map(g => (
                <button
                  key={g}
                  onClick={() => setGemstone(g)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    gemstone === g 
                      ? 'ring-2 ring-[#430562] ring-offset-2 border-white' 
                      : 'border-[#cfc2d1] hover:ring-2 hover:ring-[#430562]/50 hover:ring-offset-2'
                  }`}
                  style={{ backgroundColor: GEMSTONE_COLORS[g] || '#d1d5db' }}
                  aria-label={g}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-4 mb-10">
        <button
          onClick={onAdd}
          disabled={!inStock || submitting}
          className="w-full bg-[#430562] text-white py-4 font-montserrat text-[14px] font-semibold uppercase tracking-[0.1em] hover:bg-[#3d174f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Adding...' : inStock ? 'Add to Bag' : 'Out of Stock'}
        </button>
        <button
          onClick={onWish}
          className={`w-full py-4 font-montserrat text-[14px] font-semibold uppercase tracking-[0.1em] border transition-colors ${
            wished
              ? 'bg-[#fef8fc] text-[#430562] border-[#430562]'
              : 'bg-transparent text-[#430562] border-[#430562] hover:bg-[#fef8fc]'
          }`}
        >
          {wished ? 'Saved to Wishlist' : 'Add to Wishlist'}
        </button>
      </div>

      {/* Accordion Sections */}
      <div className="border-t border-[#cfc2d1]/50 divide-y divide-[#cfc2d1]/50">
        
        {/* Details */}
        <div>
          <button 
            onClick={() => toggleSection('details')}
            className="w-full py-5 flex justify-between items-center group"
          >
            <span className="font-montserrat text-[14px] font-semibold uppercase tracking-wider text-[#430562] group-hover:text-[#775a1a] transition-colors">
              Details
            </span>
            <ChevronDown className={`w-5 h-5 text-[#430562] transition-transform duration-300 ${openSection === 'details' ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openSection === 'details' ? 'max-h-[500px] pb-5' : 'max-h-0'}`}>
            <p className="font-montserrat text-[14px] leading-[24px] text-[#4d444f]">
              Handcrafted in our Nairobi studio. Each piece is unique.
              {product.fitNotes && <><br/><br/><strong>Fit:</strong> {product.fitNotes}</>}
            </p>
          </div>
        </div>

        {/* Jewelry Care */}
        {product.careInstructions && (
          <div>
            <button 
              onClick={() => toggleSection('care')}
              className="w-full py-5 flex justify-between items-center group"
            >
              <span className="font-montserrat text-[14px] font-semibold uppercase tracking-wider text-[#430562] group-hover:text-[#775a1a] transition-colors">
                Care Instructions
              </span>
              <ChevronDown className={`w-5 h-5 text-[#430562] transition-transform duration-300 ${openSection === 'care' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${openSection === 'care' ? 'max-h-[500px] pb-5' : 'max-h-0'}`}>
              <p className="font-montserrat text-[14px] leading-[24px] text-[#4d444f]">
                {product.careInstructions}
              </p>
            </div>
          </div>
        )}

        {/* Shipping & Returns */}
        <div>
          <button 
            onClick={() => toggleSection('shipping')}
            className="w-full py-5 flex justify-between items-center group"
          >
            <span className="font-montserrat text-[14px] font-semibold uppercase tracking-wider text-[#430562] group-hover:text-[#775a1a] transition-colors">
              Shipping & Returns
            </span>
            <ChevronDown className={`w-5 h-5 text-[#430562] transition-transform duration-300 ${openSection === 'shipping' ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openSection === 'shipping' ? 'max-h-[500px] pb-5' : 'max-h-0'}`}>
            <p className="font-montserrat text-[14px] leading-[24px] text-[#4d444f]">
              Complimentary standard delivery on orders above KES 25,000. Same-day courier available within Nairobi for orders placed before 2pm.
              <br/><br/>
              14 days to return unworn pieces in their original packaging. Bespoke and engraved pieces are final sale.
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
