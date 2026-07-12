import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { listAdminCategories } from '@/lib/admin/queries/tree';
import { CategoryForm } from '../category-form';
import {
  createCategoryAction,
} from '@/lib/admin/actions/tree';
import { checkCategorySlugAction } from '@/lib/admin/actions/slug';

export const metadata = { title: 'Admin · New category' };
export const dynamic = 'force-dynamic';

export default async function AdminNewCategoryPage() {
  await requireStaffOrAdmin('/admin/categories/new');
  const categories = await listAdminCategories();
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
      <div>
        <h1 className="font-display text-3xl">New category</h1>
        <p className="mt-1 text-sm text-muted-foreground">Group products so customers can browse by silhouette or use.</p>
      </div>
      <CategoryForm
        candidates={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
        saveAction={createCategoryAction}
        checkSlugAction={checkCategorySlugAction}
      />
    </div>
  );
}
