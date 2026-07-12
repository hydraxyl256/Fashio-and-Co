import type { Metadata } from 'next';
import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';

import { listAllActiveCategories, listProducts } from '@/lib/queries/catalogue';
import { Pagination } from '@/components/storefront/pagination';
import { publicImageUrl } from '@/lib/queries/catalogue-types';
import { SortSelect } from '@/components/storefront/sort-select';
import { FilterSidebar, FilterMobileSheet } from '@/components/storefront/product-filters';

export const metadata: Metadata = {
  title: 'Shop All | FASHION & CO.',
  description:
    'Discover a curated selection of contemporary luxury, designed in Nairobi for the modern woman.',
};

export const revalidate = 300;

/** Local shape — avoids 'never' when Supabase types lag behind the schema */
type CategoryItem = { id: string; name: string; slug: string };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function asInt(value: string | string[] | undefined, fallback: number): number {
  if (typeof value !== 'string') return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
function pickFirst(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

const SORT_OPTIONS = [
  { label: 'Newest',      value: 'newest' },
  { label: 'Featured',    value: 'featured' },
  { label: 'Price: Low',  value: 'price-asc' },
  { label: 'Price: High', value: 'price-desc' },
];

export default async function ShopAllPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const sort = (pickFirst(sp.sort) as 'newest' | 'price-asc' | 'price-desc' | 'featured') ?? 'newest';
  const page = asInt(pickFirst(sp.page), 1);
  const activeSize = pickFirst(sp.size);
  const activeColor = pickFirst(sp.color);
  const activeCategory = pickFirst(sp.category);
  const PAGE_SIZE = 24;

  const [result, rawCategories] = await Promise.all([
    listProducts({
      sort,
      page,
      size: activeSize,
      color: activeColor,
      categorySlug: activeCategory,
      pageSize: PAGE_SIZE,
    }),
    listAllActiveCategories(),
  ]);
  const categories = (rawCategories ?? []) as unknown as CategoryItem[];


  const formatPrice = (cents: number, currency: string) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency, minimumFractionDigits: 0 }).format(cents / 100);

  return (
    <div className="bg-[#fef8fc] min-h-screen font-montserrat">
      {/* Breadcrumb */}
      <div className="px-5 sm:px-10 lg:px-[80px] max-w-[1440px] mx-auto pt-8 pb-0">
        <nav className="flex items-center gap-2 font-montserrat text-[12px] font-medium uppercase tracking-widest text-[#4d444f]">
          <Link href="/" className="hover:text-[#430562] transition-colors">Home</Link>
          <span className="text-[#cfc2d1]">/</span>
          <span className="text-[#1d1b1e] font-semibold">Shop All</span>
        </nav>
      </div>

      {/* Editorial Header */}
      <div className="px-5 sm:px-10 lg:px-[80px] max-w-[1440px] mx-auto pt-8 pb-10">
        <h1 className="font-playfair text-[clamp(40px,4.5vw,64px)] leading-[1.1] tracking-[-0.02em] font-bold text-[#430562] mb-4">
          The Full Collection
        </h1>
        <p className="font-montserrat text-[18px] leading-[28px] text-[#4d444f] max-w-2xl">
          Discover a curated selection of contemporary luxury, designed in Nairobi for the modern woman.
          From shimmering silk silhouettes to artisan-crafted gold jewelry.
        </p>
      </div>      {/* Main: Sidebar + Grid */}
      <div className="px-5 sm:px-10 lg:px-[80px] max-w-[1440px] mx-auto flex gap-10 pb-[64px]">

        {/* Sidebar Filters — desktop only */}
        <FilterSidebar categories={categories} showCategory={true} />

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {/* Top bar: result count + mobile filter */}
          <div className="flex justify-between items-center mb-8">
            <p className="font-montserrat text-[14px] text-[#4d444f]">
              <span className="text-[#1d1b1e] font-semibold">{result.total}</span>{' '}
              {result.total === 1 ? 'piece' : 'pieces'}
            </p>
            <div className="flex items-center gap-4">
              <FilterMobileSheet categories={categories} showCategory={true} />
              {/* Desktop sort dropdown */}
              <SortSelect sort={sort} options={SORT_OPTIONS} />
            </div>
          </div>

          {/* Grid */}
          {result.items.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-playfair text-[32px] font-semibold text-[#1d1b1e] mb-4">No pieces found</p>
              <p className="font-montserrat text-[16px] text-[#4d444f] mb-8">Try adjusting your filters.</p>
              <Link href="/collections/shop" className="bg-[#430562] text-white px-8 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity">
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {result.items.map((product) => {
                const imgSrc = product.coverImage ? publicImageUrl(product.coverImage.storagePath) : null;
                const price = new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: product.currency,
                  minimumFractionDigits: 0,
                }).format(product.priceCents / 100);

                return (
                  <div key={product.id} className="group">
                    <Link
                      href={`/products/${product.slug}`}
                      className="block relative aspect-[3/4] overflow-hidden bg-[#f2ecf0] mb-4"
                      aria-label={product.name}
                    >
                      {imgSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imgSrc}
                          alt={product.coverImage?.altText ?? product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#e7e1e5]" />
                      )}
                      {/* Quick Add overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-[#430562] text-white py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-montserrat text-[12px] font-semibold uppercase tracking-[0.1em]">
                        Quick Add
                      </div>
                    </Link>

                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-montserrat text-[14px] font-semibold leading-[20px] uppercase tracking-[0.05em] text-[#1d1b1e] hover:text-[#430562] transition-colors mb-1">
                        {product.name}
                      </h3>
                      <p className="font-montserrat text-[16px] leading-[24px] text-[#4d444f]">
                        {price}
                      </p>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {result.pageCount > 1 && (
            <div className="mt-16">
              <Pagination
                page={result.page}
                pageCount={result.pageCount}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
