import { requireAdmin } from '@/lib/auth/session';
import { getHouseSettings } from '@/lib/admin/actions/users';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { SettingsForm } from './settings-form';

export const metadata = { title: 'Admin · House settings' };
export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireAdmin('/admin/settings');
  const settings = await getHouseSettings();
  const record: Record<string, unknown> = {};
  for (const row of settings as Array<{ key: string; value: unknown }>) {
    record[row.key] = row.value;
  }
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="House"
        title="Settings"
        description="Brand, support, and announcement text. Admin only."
      />
      <SettingsForm
        initialValues={{
          site_name: (record.site_name as string) ?? 'Fashion & Co.',
          support_email: (record.support_email as string) ?? 'support@fashionco.example',
          default_currency: (record.default_currency as string) ?? 'KES',
          announcement: (record.announcement as string) ?? '',
        }}
      />
    </div>
  );
}
