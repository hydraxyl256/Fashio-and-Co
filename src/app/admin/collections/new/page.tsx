import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createCollectionAction } from '@/lib/admin/actions/tree';
import { checkCollectionSlugAction } from '@/lib/admin/actions/slug';
import { CollectionForm } from '../collection-form';

export const metadata = { title: 'Admin · New collection' };
export const dynamic = 'force-dynamic';

export default async function AdminNewCollectionPage() {
  await requireStaffOrAdmin('/admin/collections/new');
  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, is_active')
    .order('name', { ascending: true })
    .limit(2000);
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
      <div>
        <h1 className="font-display text-3xl">New collection</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Curate a story. Add products in the order they should appear on the storefront.
        </p>
      </div>
      <CollectionForm
        products={(products ?? []).map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          isActive: p.is_active
        }))}
        saveAction={createCollectionAction}
        checkSlugAction={checkCollectionSlugAction}
      />
    </div>
  );
}
