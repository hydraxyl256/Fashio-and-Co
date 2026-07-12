/**
 * GET /api/checkout/delivery-zones
 * Return available delivery zones.
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: zones, error } = await supabase
      .from('delivery_zones')
      .select('id, name, region, country')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    return Response.json(zones || []);
  } catch (error) {
    console.error('Delivery zones error:', error);
    return Response.json({ error: 'Failed to fetch delivery zones' }, { status: 500 });
  }
}
