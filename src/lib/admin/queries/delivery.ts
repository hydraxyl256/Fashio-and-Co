import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type ZoneRow = Database['public']['Tables']['delivery_zones']['Row'];
type RateRow = Database['public']['Tables']['delivery_rates']['Row'];

export interface AdminZoneWithRates extends ZoneRow {
  rates: RateRow[];
}

export async function listAdminZones(): Promise<AdminZoneWithRates[]> {
  const supabase = await createSupabaseServerClient();
  const [{ data: zones }, { data: rates }] = await Promise.all([
    supabase
      .from('delivery_zones')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('delivery_rates')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
  ]);
  const byZone = new Map<string, RateRow[]>();
  for (const rate of rates ?? []) {
    const list = byZone.get(rate.zone_id) ?? [];
    list.push(rate as RateRow);
    byZone.set(rate.zone_id, list);
  }
  return ((zones ?? []) as ZoneRow[]).map((zone) => ({
    ...zone,
    rates: byZone.get(zone.id) ?? [],
  }));
}

export async function getAdminZone(zoneId: string) {
  const supabase = await createSupabaseServerClient();
  const [{ data: zone }, { data: rates }] = await Promise.all([
    supabase.from('delivery_zones').select('*').eq('id', zoneId).maybeSingle(),
    supabase
      .from('delivery_rates')
      .select('*')
      .eq('zone_id', zoneId)
      .order('sort_order', { ascending: true }),
  ]);
  return {
    zone: (zone ?? null) as ZoneRow | null,
    rates: (rates ?? []) as RateRow[],
  };
}
