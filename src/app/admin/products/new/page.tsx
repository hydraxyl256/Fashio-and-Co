import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { listAdminCategories } from '@/lib/admin/queries/tree';
import { ProductForm } from '../product-form';
import {
  createProductAction,
  checkSlugAvailabilityAction,
} from '@/lib/admin/actions/products';

export const metadata = { title: 'Admin · New product' };
export const dynamic = 'force-dynamic';

export default async function AdminNewProductPage() {
  await requireStaffOrAdmin('/admin/products/new');
  const categories = await listAdminCategories();
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-eyebrow uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All products
        </Link>
      </div>
      <div>
        <h1 className="font-display text-3xl">New product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Save once to create the product, then upload images and adjust stock.
        </p>
      </div>
      <ProductForm
        categories={categories}
        variants={[]}
        images={[]}
        saveAction={createProductAction}
        uploadImageAction={async () => ({ ok: false as const, error: 'Save the product first.' })}
        deleteImageAction={async () => ({ ok: false as const, error: 'Save the product first.' })}
        reorderImagesAction={async () => ({ ok: false as const, error: 'Save the product first.' })}
        setCoverAction={async () => ({ ok: false as const, error: 'Save the product first.' })}
        updateAltAction={async () => ({ ok: false as const, error: 'Save the product first.' })}
        checkSlugAction={checkSlugAvailabilityAction}
      />
    </div>
  );
}
