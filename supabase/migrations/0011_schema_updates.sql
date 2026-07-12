-- 0011_schema_updates.sql
-- Add missing columns requested for the production seed

------------------------------------------------------------------------
-- product_variants: Add barcode
------------------------------------------------------------------------
do $$ begin
  alter table public.product_variants add column barcode text;
exception when duplicate_column then null; end $$;

------------------------------------------------------------------------
-- categories: Add SEO fields
------------------------------------------------------------------------
do $$ begin
  alter table public.categories add column meta_title text;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.categories add column meta_description text;
exception when duplicate_column then null; end $$;

------------------------------------------------------------------------
-- collections: Add SEO fields
------------------------------------------------------------------------
do $$ begin
  alter table public.collections add column meta_title text;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.collections add column meta_description text;
exception when duplicate_column then null; end $$;
