import { requireStaffOrAdmin } from '@/lib/auth/session';
import { listAdminZones } from '@/lib/admin/queries/delivery';
import { formatCurrency, formatNumber } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DeliveryPanel } from './delivery-panel';

export const metadata = { title: 'Admin · Delivery' };
export const dynamic = 'force-dynamic';

export default async function AdminDeliveryPage() {
  await requireStaffOrAdmin('/admin/delivery');
  const zones = await listAdminZones();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Delivery"
        description="Zones define where you ship and the rates inside each zone that customers see at checkout."
      />
      <DeliveryPanel
        zones={zones.map((z) => ({
          id: z.id,
          name: z.name,
          country: z.country,
          region: z.region,
          isActive: z.is_active,
          sortOrder: z.sort_order,
          rateCount: z.rates.length,
          startingPriceCents: z.rates.length
            ? Math.min(...z.rates.map((r) => r.price_cents))
            : null,
          startingPriceCurrency: 'KES' as const,
        }))}
        initialRates={Object.fromEntries(
          zones.map((z) => [
            z.id,
            z.rates.map((r) => ({
              id: r.id,
              zone_id: r.zone_id,
              name: r.name,
              description: r.description,
              price_cents: r.price_cents,
              free_threshold_cents: r.free_threshold_cents,
              eta_min_days: r.eta_min_days,
              eta_max_days: r.eta_max_days,
              is_active: r.is_active,
              sort_order: r.sort_order,
              currency: 'KES',
            })),
          ]),
        )}
      />
      <div className="text-xs text-muted-foreground">
        Prices shown are the cheapest active rate per zone — {formatNumber(zones.length)} zones configured.
        {zones.length > 0 && zones[0]?.rates[0]
          ? ` Example: ${formatCurrency(zones[0].rates[0].price_cents, { currency: 'KES' })}.`
          : ''}
      </div>
    </div>
  );
}
