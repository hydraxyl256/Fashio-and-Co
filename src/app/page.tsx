import { HeroSection } from '@/components/homepage/hero-section';
import { FeaturedCollections } from '@/components/homepage/featured-collections';
import { NewArrivalsCarousel } from '@/components/homepage/new-arrivals-carousel';
import { EditorialBanner } from '@/components/homepage/editorial-banner';
import { ShopTheLook } from '@/components/homepage/shop-the-look';
import { BestSellerSection } from '@/components/homepage/best-seller-section';
import { JewelryHighlight } from '@/components/homepage/jewelry-highlight';
import { BrandStory } from '@/components/homepage/brand-story';
import { TrustSection } from '@/components/storefront/trust-section';
import { NewsletterSection } from '@/components/homepage/newsletter-section';
import { InstagramSection } from '@/components/homepage/instagram-section';

import {
  listActiveCollections,
  listAllActiveCategories,
  listFeaturedCollections,
  listHomepageSections,
  listProducts,
  getProductCountByCategory,
} from '@/lib/queries/catalogue';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { getWishlistProductIds } from '@/lib/queries/wishlist';
import { publicImageUrl } from '@/lib/queries/catalogue-types';

export const revalidate = 300;

export default async function HomePage() {
  const [
    newArrivals,
    bestSellers,
  ] = await Promise.all([
    listProducts({ sort: 'newest', pageSize: 4 }),
    listProducts({ sort: 'featured', pageSize: 4 }),
  ]);

  // For QuickAdd we need the first active variant id per product.
  const admin = await createSupabaseServiceRoleClient();
  const enrichedNew = await attachFirstVariant(newArrivals.items, admin);
  const enrichedBest = await attachFirstVariant(bestSellers.items, admin);

  const formatPrice = (cents: number, curr: string) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: curr, minimumFractionDigits: 0 }).format(cents / 100);

  const formattedNewArrivals = enrichedNew.map(p => ({
    id: p.id,
    name: p.name,
    price: formatPrice(p.priceCents, p.currency),
    href: `/products/${p.slug}`,
    imageSrc: p.coverImage ? publicImageUrl(p.coverImage.storagePath) : '',
    imageAlt: p.coverImage?.altText || p.name,
  }));

  const formattedBestSellers = enrichedBest.map(p => ({
    id: p.id,
    name: p.name,
    price: formatPrice(p.priceCents, p.currency),
    href: `/products/${p.slug}`,
    imageSrc: p.coverImage ? publicImageUrl(p.coverImage.storagePath) : '',
    imageAlt: p.coverImage?.altText || p.name,
  }));

  return (
    <div className="bg-[#fef8fc] text-[#1d1b1e]">
      <HeroSection />
      <FeaturedCollections />
      <NewArrivalsCarousel products={formattedNewArrivals.length > 0 ? formattedNewArrivals : undefined} />
      <EditorialBanner />
      <ShopTheLook />
      <BestSellerSection products={formattedBestSellers.length > 0 ? formattedBestSellers : undefined} />
      <JewelryHighlight />
      <BrandStory />
      <TrustSection />
      <NewsletterSection />
      <InstagramSection />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function attachFirstVariant<
  T extends {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    compareAtPriceCents: number | null;
    currency: string;
    isFeatured: boolean;
    inStock: boolean;
    coverImage: { storagePath: string; altText: string | null } | null;
    availableSizes: string[];
    publishedAt: string | null;
  },
>(items: T[], admin: Awaited<ReturnType<typeof createSupabaseServiceRoleClient>>): Promise<
  Array<T & { firstVariantId: string | null }>
> {
  if (items.length === 0) return [];
  const ids = items.map((i) => i.id);
  const { data: variants } = await admin
    .from('product_variants')
    .select('id, product_id, is_active, stock_quantity, reserved_quantity')
    .in('product_id', ids)
    .eq('is_active', true)
    .order('position', { ascending: true });

  const byProduct = new Map<string, string | null>();
  for (const id of ids) byProduct.set(id, null);
  for (const v of (variants ?? []) as Array<{
    id: string;
    product_id: string;
    stock_quantity: number;
    reserved_quantity: number;
  }>) {
    const stock = Math.max(0, v.stock_quantity - v.reserved_quantity);
    if (stock <= 0) continue;
    if (!byProduct.get(v.product_id)) byProduct.set(v.product_id, v.id);
  }

  return items.map((item) => ({ ...item, firstVariantId: byProduct.get(item.id) ?? null }));
}
