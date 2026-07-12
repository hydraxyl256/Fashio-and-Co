import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

import { getProductBySlug, getRelatedProducts } from '@/lib/queries/catalogue';
import { getWishlistProductIds } from '@/lib/queries/wishlist';
import { ProductGallery } from '@/components/storefront/product-gallery';
import { ProductBuyBox } from '@/components/storefront/product-buy-box';
import { publicImageUrl } from '@/lib/queries/catalogue';

export const revalidate = 300;

/** Extended product shape — avoids 'never' when Supabase types lag */
type ProductData = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  full_description: string | null;
  currency: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  care_instructions: string | null;
  fit_notes: string | null;
  category_id: string | null;
  category: { id: string; name: string; slug: string } | null;
  images: unknown;
  variants: unknown;
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const raw = await getProductBySlug(slug);
  if (!raw) return { title: 'Piece not found' };
  const data = raw as unknown as ProductData;

  const cover = (data.images as Array<{ storage_path: string; alt_text: string | null; is_cover: boolean; display_order: number }>)
    .slice()
    .sort((a, b) => (a.is_cover === b.is_cover ? a.display_order - b.display_order : a.is_cover ? -1 : 1))[0];

  return {
    title: `${data.name} | FASHION & CO.`,
    description: data.short_description ?? data.full_description ?? `${data.name} from Fashion & Co.`,
    openGraph: {
      title: `${data.name} — Fashion & Co.`,
      description: data.short_description ?? undefined,
      images: cover
        ? [{ url: publicImageUrl(cover.storage_path), width: 1200, height: 1500, alt: cover.alt_text ?? data.name }]
        : undefined,
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const raw = await getProductBySlug(slug);
  if (!raw) notFound();
  const data = raw as unknown as ProductData;

  const variants = (data.variants as Array<{
    id: string;
    sku: string;
    size: string | null;
    color: string | null;
    material: string | null;
    metal: string | null;
    gemstone: string | null;
    ring_size: string | null;
    chain_length_cm: number | null;
    stock_quantity: number;
    reserved_quantity: number;
    price_override_cents: number | null;
    compare_at_price_cents: number | null;
    is_active: boolean;
  }>).map((v) => ({
    id: v.id,
    sku: v.sku,
    size: v.size,
    color: v.color,
    material: v.material,
    metal: v.metal,
    gemstone: v.gemstone,
    ringSize: v.ring_size,
    chainLengthCm: v.chain_length_cm,
    stockQuantity: v.stock_quantity,
    reservedQuantity: v.reserved_quantity,
    priceOverrideCents: v.price_override_cents,
    compareAtPriceCents: v.compare_at_price_cents,
    isActive: v.is_active,
  }));

  const images = (data.images as Array<{ storage_path: string; alt_text: string | null }>).map((i) => ({
    storagePath: i.storage_path,
    altText: i.alt_text,
  }));

  const wishlistIds = await getWishlistProductIds();
  const initiallyWished = wishlistIds.includes(data.id);

  const related = await getRelatedProducts(data.id, data.category_id, 4);

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: data.currency, minimumFractionDigits: 0 }).format(cents / 100);

  // JSON-LD structured data for SEO
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.short_description ?? data.full_description ?? undefined,
    sku: variants[0]?.sku,
    brand: { '@type': 'Brand', name: 'Fashion & Co.' },
    offers: variants.map((v) => ({
      '@type': 'Offer',
      sku: v.sku,
      price: ((v.priceOverrideCents ?? data.price_cents) / 100).toFixed(2),
      priceCurrency: data.currency,
      availability:
        v.stockQuantity - v.reservedQuantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    })),
  };

  return (
    <div className="bg-[#fef8fc] text-[#1d1b1e] font-montserrat">
      {/* Breadcrumb */}
      <div className="px-5 sm:px-10 lg:px-[80px] max-w-[1440px] mx-auto pt-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-montserrat text-[12px] font-medium uppercase tracking-widest text-[#7e7480]">
          <Link href="/" className="hover:text-[#430562] transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          {data.category ? (
            <>
              <Link href={`/collections/category/${data.category.slug}`} className="hover:text-[#430562] transition-colors">
                {data.category.name}
              </Link>
              <ChevronRight className="h-3 w-3" aria-hidden />
            </>
          ) : null}
          <span className="text-[#1d1b1e]">{data.name}</span>
        </nav>
      </div>

      {/* Main product hero: 7/5 grid on desktop */}
      <div className="px-5 sm:px-10 lg:px-[80px] max-w-[1440px] mx-auto pt-8 pb-[64px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Gallery — lg:col-span-7: asymmetric Stitch layout */}
          <div className="lg:col-span-7">
            <ProductGallery images={images} productName={data.name} />
          </div>

          {/* Buy Box — lg:col-span-5 sticky */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <ProductBuyBox
              product={{
                id: data.id,
                slug: data.slug,
                name: data.name,
                shortDescription: data.short_description,
                fullDescription: data.full_description,
                categoryId: data.category_id,
                priceCents: data.price_cents,
                compareAtPriceCents: data.compare_at_price_cents,
                currency: data.currency,
                careInstructions: data.care_instructions,
                fitNotes: data.fit_notes,
                coverImage: images[0]?.storagePath ?? null,
              }}
              variants={variants}
              initiallyWished={initiallyWished}
              sizeGuide={{
                title: 'Sizing notes',
                body: 'For womenswear, take your usual size. Linen pieces are cut on the bias and skim the body. For jewelry, see the chain length and metal weight on the product page.',
              }}
            />
          </div>
        </div>

        {/* Related / Complete the Look */}
        {related.length > 0 ? (
          <section className="mt-[64px] pt-[64px] border-t border-[#cfc2d1]/30">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="font-montserrat text-[12px] font-medium uppercase tracking-[0.12em] text-[#775a1a]">
                  Worn With
                </span>
                <h2 className="font-playfair text-[48px] font-semibold leading-[56px] text-[#1d1b1e] mt-1">
                  Complete the Look
                </h2>
              </div>
              <Link href="/collections/shop" className="font-montserrat text-[14px] font-semibold uppercase tracking-wider text-[#430562] border-b border-[#430562] pb-0.5 hover:opacity-70 transition-opacity">
                Shop All
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => {
                const imgSrc = p.coverImage ? publicImageUrl(p.coverImage.storagePath) : null;
                const price = new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: p.currency,
                  minimumFractionDigits: 0,
                }).format(p.priceCents / 100);
                return (
                  <div key={p.id} className="group">
                    <Link
                      href={`/products/${p.slug}`}
                      className="block relative aspect-[3/4] overflow-hidden bg-[#f2ecf0] mb-4"
                    >
                      {imgSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imgSrc}
                          alt={p.coverImage?.altText ?? p.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : <div className="w-full h-full bg-[#e7e1e5]" />}
                    </Link>
                    <Link href={`/products/${p.slug}`}>
                      <h4 className="font-montserrat text-[14px] font-semibold uppercase tracking-[0.05em] text-[#1d1b1e] hover:text-[#430562] transition-colors mb-1">
                        {p.name}
                      </h4>
                      <p className="font-montserrat text-[16px] text-[#4d444f]">{price}</p>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
    </div>
  );
}
