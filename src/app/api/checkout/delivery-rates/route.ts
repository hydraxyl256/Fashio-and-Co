/**
 * GET /api/checkout/delivery-rates?zoneId=...
 * Return delivery rates for a specific zone.
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zoneId');

    if (!zoneId) {
      return Response.json(
        { error: 'Zone ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data: rates, error } = await supabase
      .from('delivery_rates')
      .select('id, name, description, price_cents, eta_min_days, eta_max_days')
      .eq('zone_id', zoneId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    // Transform to frontend format
    const formatted = (rates || []).map((rate) => ({
      id: rate.id,
      name: rate.name,
      description: rate.description,
      pricePercentage: rate.price_cents,
      etaMinDays: rate.eta_min_days,
      etaMaxDays: rate.eta_max_days,
    }));

    return Response.json(formatted);
  } catch (error) {
    console.error('Delivery rates error:', error);
    return Response.json({ error: 'Failed to fetch delivery rates' }, { status: 500 });
  }
}
