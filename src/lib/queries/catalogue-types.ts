/**
 * Types and utilities for the catalogue - safe to use in client components.
 * This file does NOT have 'server-only' so client components can import from it.
 */

export interface ProductFilters {
  categorySlug?: string;
  collectionSlug?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  size?: string | null;
  color?: string | null;
  inStockOnly?: boolean;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'featured';
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ProductListResult {
  items: ProductCardData[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  facets: ProductFacets;
}

export interface ProductFacets {
  sizes: string[];
  colors: string[];
  priceRange: { min: number; max: number };
}

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  isFeatured: boolean;
  category: { name: string; slug: string } | null;
  coverImage: { storagePath: string; altText: string | null } | null;
  availableSizes: string[];
  inStock: boolean;
  publishedAt: string | null;
}

// Public buckets: Supabase storage paths are constructed as public URLs.
// These buckets are publicly accessible, so we can construct URLs directly
// without a signed call.
const PUBLIC_BUCKETS = new Set([
  'product-images',
  'collection-images',
  'campaign-images',
  'avatars',
]);

export function publicImageUrl(storagePath: string, bucket = 'product-images'): string {
  if (!storagePath) return '';
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return '';
  if (!PUBLIC_BUCKETS.has(bucket)) return '';
  // Encode each segment so spaces in folder names are handled correctly.
  const encoded = storagePath.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}
