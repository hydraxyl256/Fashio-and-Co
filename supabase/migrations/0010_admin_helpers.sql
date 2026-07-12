-- 0010_admin_helpers.sql
-- Admin-only helpers used by the back-office:
--   * apply_inventory_movement(...) — atomic stock update + movement row,
--     refuses to take stock below zero or below reserved_quantity.
--   * low_stock_variants — read view for the dashboard.
--   * house_settings — tiny key-value store for site-level configuration
--     managed by admins (announcement text, support email, default currency).
--   * increment_discount_redemptions — service-role helper for redemption
--     counter bookkeeping.
-- All write paths are SECURITY DEFINER so that the RLS-aware admin client
-- can still rely on a single, audited code path.

------------------------------------------------------------------------
-- 1. apply_inventory_movement
------------------------------------------------------------------------
create or replace function public.apply_inventory_movement(
  p_variant_id uuid,
  p_delta integer,
  p_reason inventory_movement_reason,
  p_note text,
  p_order_id uuid
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_stock integer;
begin
  if p_delta = 0 then
    raise exception 'Inventory movement delta must be non-zero'
      using errcode = 'check_violation';
  end if;

  update public.product_variants
     set stock_quantity = stock_quantity + p_delta
   where id = p_variant_id
     and stock_quantity + p_delta >= 0
     and stock_quantity + p_delta >= reserved_quantity
  returning stock_quantity into v_new_stock;

  if v_new_stock is null then
    raise exception 'Insufficient stock for variant %', p_variant_id
      using errcode = 'check_violation';
  end if;

  insert into public.inventory_movements
    (variant_id, delta, reason, note, order_id, performed_by)
  values
    (p_variant_id, p_delta, p_reason, p_note, p_order_id, auth.uid());

  return v_new_stock;
end;
$$;

revoke all on function public.apply_inventory_movement(
  uuid, integer, inventory_movement_reason, text, uuid
) from public;
grant execute on function public.apply_inventory_movement(
  uuid, integer, inventory_movement_reason, text, uuid
) to authenticated;

------------------------------------------------------------------------
-- 2. low_stock_variants view
--    "Available" = stock - reserved. Variants with available stock at or
--    below their low_stock_threshold show up here.
------------------------------------------------------------------------
create or replace view public.low_stock_variants as
select
  pv.id,
  pv.product_id,
  pv.sku,
  pv.size,
  pv.color,
  pv.metal,
  pv.material,
  pv.stock_quantity,
  pv.reserved_quantity,
  pv.low_stock_threshold,
  (pv.stock_quantity - pv.reserved_quantity) as available,
  p.name as product_name,
  p.slug  as product_slug
from public.product_variants pv
join public.products p on p.id = pv.product_id
where pv.is_active = true
  and p.is_active = true
  and (pv.stock_quantity - pv.reserved_quantity) <= pv.low_stock_threshold;

grant select on public.low_stock_variants to authenticated;

------------------------------------------------------------------------
-- 3. house_settings (admin-configurable key/value store)
------------------------------------------------------------------------
create table if not exists public.house_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger house_settings_set_updated_at
  before update on public.house_settings
  for each row execute function public.set_updated_at();

alter table public.house_settings enable row level security;

drop policy if exists "house_settings_select_staff" on public.house_settings;
create policy "house_settings_select_staff"
  on public.house_settings for select
  to authenticated
  using (public.is_staff_or_admin());

drop policy if exists "house_settings_admin_write" on public.house_settings;
create policy "house_settings_admin_write"
  on public.house_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

------------------------------------------------------------------------
-- 4. increment_discount_redemptions
--    Bumps the redemption counter atomically. Called from a service-role
--    context when a discount is applied to a real order.
------------------------------------------------------------------------
create or replace function public.increment_discount_redemptions(p_discount_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_count integer;
begin
  update public.discount_codes
     set redemptions_count = redemptions_count + 1
   where id = p_discount_id
  returning redemptions_count into v_new_count;

  if v_new_count is null then
    raise exception 'Discount code % not found', p_discount_id
      using errcode = 'no_data_found';
  end if;

  return v_new_count;
end;
$$;

revoke all on function public.increment_discount_redemptions(uuid) from public;
grant execute on function public.increment_discount_redemptions(uuid) to authenticated;

------------------------------------------------------------------------
-- 5. record_order_status_change
--    Convenience wrapper that updates orders.status + timestamp columns
--    and writes a row to order_status_history atomically. Status timestamps
--    (paid_at, shipped_at, etc.) are set on first transition; clearing
--    them is not supported.
------------------------------------------------------------------------
create or replace function public.record_order_status_change(
  p_order_id uuid,
  p_from_status order_status,
  p_to_status order_status,
  p_note text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
     set status      = p_to_status,
         paid_at     = case when p_to_status = 'paid'        and paid_at     is null then now() else paid_at     end,
         shipped_at  = case when p_to_status = 'shipped'     and shipped_at  is null then now() else shipped_at  end,
         delivered_at= case when p_to_status = 'delivered'   and delivered_at is null then now() else delivered_at end,
         cancelled_at= case when p_to_status = 'cancelled'   and cancelled_at is null then now() else cancelled_at end
   where id = p_order_id
     and status = p_from_status;

  insert into public.order_status_history
    (order_id, from_status, to_status, changed_by, note)
  values
    (p_order_id, p_from_status, p_to_status, auth.uid(), p_note);
end;
$$;

revoke all on function public.record_order_status_change(
  uuid, order_status, order_status, text
) from public;
grant execute on function public.record_order_status_change(
  uuid, order_status, order_status, text
) to authenticated;
