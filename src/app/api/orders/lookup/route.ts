/**
 * POST /api/orders/lookup
 * Lookup an order by order number and email (privacy-safe).
 * Only returns order if email matches exactly.
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';

interface LookupRequest {
  orderNumber: string;
  email: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LookupRequest;

    if (!body.orderNumber || !body.email) {
      return new Response(JSON.stringify({ error: 'Order number and email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = await createSupabaseServerClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        customer_email,
        customer_full_name,
        status,
        total_cents,
        placed_at,
        shipped_at,
        delivered_at,
        order_items (
          id,
          product_name,
          quantity,
          unit_price_cents,
          image_url
        ),
        order_status_history (
          id,
          from_status,
          to_status,
          created_at,
          note
        )
      `,
      )
      .eq('order_number', body.orderNumber)
      .eq('customer_email', body.email.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw error;
    }

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Order lookup error:', error);
    return new Response(JSON.stringify({ error: 'Failed to lookup order' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
