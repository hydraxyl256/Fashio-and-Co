-- make_staff.sql
-- Promote a user to staff. Run in the Supabase SQL editor after sign-up.
update public.user_roles
set role = 'staff', updated_at = now()
where user_id = (
  select id from auth.users where email = 'staff@fashionandco.co.ke'
);
