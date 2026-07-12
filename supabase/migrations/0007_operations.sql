-- 0007_operations.sql
-- homepage_sections and audit_logs. Homepage content is public-readable;
-- audit logs are staff-only and only ever written by the service role.

------------------------------------------------------------------------
-- homepage_sections
------------------------------------------------------------------------
create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  kind homepage_section_kind not null,
  slug text not null unique,
  title text,
  subtitle text,
  body text,
  image_url text,
  cta_label text,
  cta_href text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_sections_window
    check (starts_at is null or ends_at is null or ends_at > starts_at)
);

create index if not exists homepage_sections_order_idx
  on public.homepage_sections (display_order);
create index if not exists homepage_sections_active_idx
  on public.homepage_sections (is_active);

create trigger homepage_sections_set_updated_at
  before update on public.homepage_sections
  for each row execute function public.set_updated_at();

alter table public.homepage_sections enable row level security;

drop policy if exists "homepage_sections_public_read" on public.homepage_sections;
create policy "homepage_sections_public_read"
  on public.homepage_sections for select
  to anon, authenticated
  using (is_active = true or public.is_staff_or_admin());

drop policy if exists "homepage_sections_staff_write" on public.homepage_sections;
create policy "homepage_sections_staff_write"
  on public.homepage_sections for all
  to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

------------------------------------------------------------------------
-- audit_logs
------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  actor_role user_role,
  action text not null,
  entity_type text,
  entity_id uuid,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_actor_idx on public.audit_logs (actor_id);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;

-- Only admins can read the log. The browser is denied all writes.
drop policy if exists "audit_logs_select_admin" on public.audit_logs;
create policy "audit_logs_select_admin"
  on public.audit_logs for select
  to authenticated
  using (public.is_admin());
