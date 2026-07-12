import type { MetadataRoute } from 'next';

import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = await createSupabaseServiceRoleClient();
  const now = new Date().toISOString();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/collections`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/collections/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: 'never', priority: 0.3 },
    { url: `${SITE_URL}/journal`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/bag`, lastModified: now, changeFrequency: 'never', priority: 0.2 },
    { url: `${SITE_URL}/account`, lastModified: now, changeFrequency: 'never', priority: 0.2 },
  ];

  // Categories
  const { data: categories } = await admin
    .from('categories')
    .select('slug, updated_at')
    .eq('is_active', true);
  const categoryEntries: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${SITE_URL}/collections/category/${c.slug}`,
    lastModified: c.updated_at ?? now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Collections
  const { data: collections } = await admin
    .from('collections')
    .select('slug, updated_at')
    .eq('is_active', true);
  const collectionEntries: MetadataRoute.Sitemap = (collections ?? []).map((c) => ({
    url: `${SITE_URL}/collections/${c.slug}`,
    lastModified: c.updated_at ?? now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Products — only published, active.
  const { data: products } = await admin
    .from('products')
    .select('slug, updated_at, published_at')
    .eq('is_active', true)
    .not('published_at', 'is', null);
  const productEntries: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: p.updated_at ?? p.published_at ?? now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...collectionEntries, ...productEntries];
}
