import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Heart } from 'lucide-react';

import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { getWishlistProductIds } from '@/lib/queries/wishlist';
import { getSession } from '@/lib/auth/session';
import { publicImageUrl } from '@/lib/queries/catalogue';
import { WishlistCard } from '@/components/wishlist/wishlist-card';

export const metadata: Metadata = { title: 'Your Wishlist | FASHION & CO.' };

export const revalidate = 0; // Don't cache wishlist page statically

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) redirect('/sign-in?next=/account/wishlist');

  const ids = await getWishlistProductIds();
  let rows: Array<{
    id: string;
    slug: string;
    name: string;
    price_cents: number;
    currency: string;
    cover: { storage_path: string } | null;
    category: { name: string } | null;
    default_variant_id: string | null;
  }> = [];

  if (ids.length > 0) {
    const admin = await createSupabaseServiceRoleClient();
    const { data: products } = await admin
      .from('products')
      .select(`
        id, 
        slug, 
        name, 
        price_cents, 
        currency,
        categories (name),
        images:product_images (storage_path, is_cover, display_order),
        variants (id, is_active, stock_quantity, reserved_quantity)
      `)
      .in('id', ids);

    rows = (products ?? []).map((p) => {
      const images = ((p.images ?? []) as unknown) as Array<{ storage_path: string; is_cover: boolean; display_order: number }>;
      const cover = images.find((i) => i.is_cover) ?? images.slice().sort((a, b) => a.display_order - b.display_order)[0];
      
      const variants = (p.variants as unknown) as Array<{ id: string; is_active: boolean; stock_quantity: number; reserved_quantity: number }>;
      const defaultVariant = variants.find(v => v.is_active && (v.stock_quantity - v.reserved_quantity > 0));

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price_cents: p.price_cents,
        currency: p.currency,
        cover: cover ? { storage_path: cover.storage_path } : null,
        category: Array.isArray(p.categories) ? p.categories[0] : p.categories,
        default_variant_id: defaultVariant ? defaultVariant.id : null,
      };
    });
  }

  // Basic client-side-like filtering tabs structure. Since it's a server component we can just show 'All' for now,
  // or link to ?filter=clothing etc if we want full functionality. I will implement static tabs for the UI match.
  const TABS = ['All', 'Clothing', 'Jewelry', 'Accessories'];

  return (
    <div className="bg-[#fef8fc] min-h-[70vh] font-montserrat text-[#1d1b1e]">
      <div className="pt-10 pb-20">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-playfair text-[32px] md:text-[40px] font-bold text-[#430562] mb-2">
            Your Wishlist
          </h1>
          <p className="text-[14px] text-[#4d444f]">
            {rows.length} {rows.length === 1 ? 'piece' : 'pieces'} saved
          </p>
        </div>

        {/* Filter Tabs */}
        {rows.length > 0 && (
          <div className="flex justify-center mb-12">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-6 border-b border-[#cfc2d1]/50 px-4 w-full max-w-2xl">
              {TABS.map((tab, idx) => (
                <button
                  key={tab}
                  className={`px-4 py-3 font-montserrat text-[14px] font-semibold uppercase tracking-wider transition-colors ${
                    idx === 0
                      ? 'text-[#430562] border-b-2 border-[#430562]'
                      : 'text-[#7e7480] hover:text-[#430562]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-5">
            <Heart className="w-12 h-12 text-[#cfc2d1] mb-4" strokeWidth={1.5} />
            <h2 className="font-playfair text-[24px] font-semibold text-[#1d1b1e] mb-2">
              No saved pieces yet
            </h2>
            <p className="text-[14px] text-[#4d444f] mb-8 max-w-sm">
              Tap the heart on any piece to save it for later. Your wishlist will be shared across all your devices.
            </p>
            <Link
              href="/collections/shop"
              className="bg-[#430562] text-white px-8 py-4 text-[14px] font-semibold uppercase tracking-wider hover:bg-[#3d174f] transition-colors"
            >
              Browse the edit
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {rows.map((p) => {
              const img = p.cover ? publicImageUrl(p.cover.storage_path) : null;
              const priceFormatted = new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: p.currency,
                minimumFractionDigits: 0,
              }).format(p.price_cents / 100);

              return (
                <WishlistCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  priceFormatted={priceFormatted}
                  imageSrc={img}
                  defaultVariantId={p.default_variant_id}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
