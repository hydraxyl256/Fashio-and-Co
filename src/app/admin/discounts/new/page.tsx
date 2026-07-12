import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { createDiscountAction } from '@/lib/admin/actions/discounts';
import { DiscountForm } from '../discount-form';

export const metadata = { title: 'Admin · New discount' };
export const dynamic = 'force-dynamic';

export default async function AdminNewDiscountPage() {
  await requireStaffOrAdmin('/admin/discounts/new');
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/discounts"
          className="inline-flex items-center gap-1 text-eyebrow uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All discounts
        </Link>
      </div>
      <div>
        <h1 className="font-display text-3xl">New discount</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Codes are uppercased. Validation lives in the server action — bad codes never reach the database.
        </p>
      </div>
      <DiscountForm saveAction={createDiscountAction} />
    </div>
  );
}
