-- make_admin.sql
-- Promote a user to admin. Run this in the Supabase SQL editor after
-- the user has signed up via the auth flow.
--
-- Usage: replace 'admin@fashionandco.co.ke' with the target email.
update public.user_roles
set role = 'admin', updated_at = now()
where user_id = (
  select id from auth.users where email = 'admin@fashionandco.co.ke'
);
