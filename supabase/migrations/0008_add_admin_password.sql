alter table users
  add column if not exists password_hash text;

update users
set password_hash = '$2a$12$cEk0B2WN/yDs7zJKKcWrm.Aq99C3is5ROSIKmyvsryuleq8pLPA0C'
where lower(email) = 'egovadmin@gmail.com'
  and role = 'admin';

alter table users
  drop constraint if exists users_admin_password_check;

alter table users
  add constraint users_admin_password_check
  check (role <> 'admin' or password_hash is not null);
