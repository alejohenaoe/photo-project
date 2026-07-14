-- Seed: create photographer user for local development
-- email: foto@test.com / password: test123

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'foto@test.com',
  crypt('test123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- The on_auth_user_created trigger already creates a profile with role='client',
-- so we update it to 'photographer' and set the name
update public.profiles
set role = 'photographer', name = 'Fotógrafo'
where id = (select id from auth.users where email = 'foto@test.com');
