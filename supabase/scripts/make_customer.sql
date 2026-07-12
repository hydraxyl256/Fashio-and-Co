-- make_customer.sql
-- Demote a user to the default customer role. Useful when resetting
-- accounts in development.
update public.user_roles
set role = 'customer', updated_at = now()
where user_id = (
  select id from auth.users where email = 'customer@fashionandco.co.ke'
);
