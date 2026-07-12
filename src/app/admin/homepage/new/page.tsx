import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { createHomepageSectionAction } from '@/lib/admin/actions/homepage';
import { HomepageForm } from '../homepage-form';

export const metadata = { title: 'Admin · New homepage section' };
export const dynamic = 'force-dynamic';

export default async function AdminNewHomepagePage() {
  await requireStaffOrAdmin('/admin/homepage/new');
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/homepage"
          className="inline-flex items-center gap-1 text-eyebrow uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All sections
        </Link>
      </div>
      <div>
        <h1 className="font-display text-3xl">New homepage section</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Each section is rendered in display order. Set a window for time-bounded content.
        </p>
      </div>
      <HomepageForm saveAction={createHomepageSectionAction} />
    </div>
  );
}
