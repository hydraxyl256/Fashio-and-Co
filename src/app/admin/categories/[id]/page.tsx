import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { getAdminCategory, listAdminCategories } from '@/lib/admin/queries/tree';
import { CategoryForm } from '../category-form';
import {
  updateCategoryAction,
  archiveCategoryAction,
  restoreCategoryAction,
} from '@/lib/admin/actions/tree';
import { checkCategorySlugAction } from '@/lib/admin/actions/slug';
import { CategoryArchiveButton } from './category-archive-button';

export const metadata = { title: 'Admin · Edit category' };
export const dynamic = 'force-dynamic';

export default async function AdminEditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffOrAdmin('/admin/categories');
  const { id } = await params;
  const [{ category, candidates }, allCategories] = await Promise.all([
    getAdminCategory(id),
    listAdminCategories(),
  ]);
  if (!category) notFound();

  const parentName = category.parent_id
    ? allCategories.find((c) => c.id === category.parent_id)?.name ?? null
    : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-1 text-eyebrow uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All categories
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,18rem]">
        <div className="space-y-6">
          <div>
            <p className="eyebrow text-muted-foreground">{category.is_active ? 'Active' : 'Archived'}</p>
            <h1 className="mt-1 font-display text-3xl">{category.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-mono">{category.slug}</span>
              {parentName ? ` · under ${parentName}` : ''}
            </p>
          </div>
          <CategoryForm
            categoryId={category.id}
            initialValues={{
              name: category.name,
              slug: category.slug,
              description: category.description,
              parentId: category.parent_id,
              displayOrder: category.display_order,
              isActive: category.is_active,
            }}
            candidates={candidates}
            saveAction={async (input) => {
              if (!input.id) return { ok: false, error: 'Missing category id.' };
              const res = await updateCategoryAction({ ...input, id: input.id });
              return res.ok
                ? { ok: true as const, data: { id: input.id, slug: '' } }
                : { ok: false as const, error: res.error };
            }}
            checkSlugAction={checkCategorySlugAction}
          />
        </div>
        <aside className="space-y-4">
          <div className="border border-border bg-card p-4">
            <p className="eyebrow text-muted-foreground">Danger zone</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Archiving hides the category from navigation. Products remain attached but become uncategorised.
            </p>
            <CategoryArchiveButton categoryId={category.id} isActive={category.is_active} />
          </div>
        </aside>
      </div>
    </div>
  );
}
