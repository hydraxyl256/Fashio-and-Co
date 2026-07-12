import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { getAdminCollection } from '@/lib/admin/queries/tree';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  updateCollectionAction,
  archiveCollectionAction,
  restoreCollectionAction,
} from '@/lib/admin/actions/tree';
import { checkCollectionSlugAction } from '@/lib/admin/actions/slug';
import { CollectionForm } from '../collection-form';
import { CollectionArchiveButton } from './collection-archive-button';

export const metadata = { title: 'Admin · Edit collection' };
export const dynamic = 'force-dynamic';

export default async function AdminEditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffOrAdmin('/admin/collections');
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [{ collection, products, assignments }, { data: allProducts }] = await Promise.all([
    getAdminCollection(id),
    supabase
      .from('products')
      .select('id, name, slug, is_active')
      .order('name', { ascending: true })
      .limit(2000),
  ]);
  if (!collection) notFound();

  // Pre-sort assigned ids by display_order so the form opens in the right sequence.
  const assignedIds = Array.from(assignments.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([productId]) => productId);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/collections"
          className="inline-flex items-center gap-1 text-eyebrow uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All collections
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,18rem]">
        <div className="space-y-6">
          <div>
            <p className="eyebrow text-muted-foreground">
              {collection.is_active ? 'Active' : 'Archived'}
              {collection.is_featured ? ' · Featured' : ''}
            </p>
            <h1 className="mt-1 font-display text-3xl">{collection.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-mono">{collection.slug}</span> · {products.length} candidate products
            </p>
          </div>
          <CollectionForm
            collectionId={collection.id}
            initialValues={{
              name: collection.name,
              slug: collection.slug,
              subtitle: collection.subtitle,
              description: collection.description,
              heroImageUrl: collection.hero_image_url,
              launchAt: collection.launch_at,
              endAt: collection.end_at,
              isActive: collection.is_active,
              isFeatured: collection.is_featured,
              productIds: assignedIds,
            }}
            products={allProducts ?? []}
            saveAction={async (input) => {
              if (!input.id) return { ok: false, error: 'Missing collection id.' };
              const res = await updateCollectionAction({ ...input, id: input.id });
              return res.ok
                ? { ok: true as const, data: { id: input.id, slug: '' } }
                : { ok: false as const, error: res.error };
            }}
            checkSlugAction={checkCollectionSlugAction}
          />
        </div>
        <aside className="space-y-4">
          <div className="border border-border bg-card p-4">
            <p className="eyebrow text-muted-foreground">Danger zone</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Archiving hides the collection from the storefront. Products are kept intact.
            </p>
            <CollectionArchiveButton
              collectionId={collection.id}
              isActive={collection.is_active}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
