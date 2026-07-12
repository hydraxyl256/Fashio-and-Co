-- 0008_storage.sql
-- Supabase Storage buckets and policies. Buckets are created idempotently
-- via the storage.create_bucket helper, then RLS-style storage policies
-- gate uploads to staff/admin only.

-- Buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images',  'product-images',  true,  10485760, array['image/webp', 'image/jpeg', 'image/png', 'image/avif']),
  ('collection-images','collection-images', true, 10485760, array['image/webp', 'image/jpeg', 'image/png', 'image/avif']),
  ('campaign-images', 'campaign-images',  true,  10485760, array['image/webp', 'image/jpeg', 'image/png', 'image/avif']),
  ('avatars',         'avatars',         true,   2097152, array['image/webp', 'image/jpeg', 'image/png', 'image/avif']),
  ('user-uploads',    'user-uploads',    false,  5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

------------------------------------------------------------------------
-- Policies on storage.objects
------------------------------------------------------------------------

-- Public read for the four image buckets (campaign, product, collection, avatars)
drop policy if exists "storage_public_read" on storage.objects;
create policy "storage_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('product-images', 'collection-images', 'campaign-images', 'avatars'));

-- Staff/admin write for catalogue & campaign assets
drop policy if exists "storage_staff_write_catalogue" on storage.objects;
create policy "storage_staff_write_catalogue"
  on storage.objects for all
  to authenticated
  using (
    bucket_id in ('product-images', 'collection-images', 'campaign-images')
    and public.is_staff_or_admin()
  )
  with check (
    bucket_id in ('product-images', 'collection-images', 'campaign-images')
    and public.is_staff_or_admin()
  );

-- Avatars: a user can write to their own folder; staff can write any.
drop policy if exists "storage_avatar_self_write" on storage.objects;
create policy "storage_avatar_self_write"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage_avatar_staff_write" on storage.objects;
create policy "storage_avatar_staff_write"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'avatars' and public.is_staff_or_admin()
  )
  with check (
    bucket_id = 'avatars' and public.is_staff_or_admin()
  );

-- User uploads (private): only the owner or staff can read; only the owner
-- can write into their own folder.
drop policy if exists "storage_user_uploads_owner_read" on storage.objects;
create policy "storage_user_uploads_owner_read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'user-uploads'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff_or_admin())
  );

drop policy if exists "storage_user_uploads_owner_write" on storage.objects;
create policy "storage_user_uploads_owner_write"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
