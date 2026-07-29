alter table users
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin')),
  alter column phone drop not null;

alter table users
  drop constraint if exists users_login_identity_check;

alter table users
  add constraint users_login_identity_check
  check (
    (role = 'user' and phone is not null)
    or (role = 'admin' and email is not null)
  );

update users
set role = 'admin'
where lower(email) = 'egovadmin@gmail.com';

insert into users (email, role)
select 'egovadmin@gmail.com', 'admin'
where not exists (
  select 1
  from users
  where lower(email) = 'egovadmin@gmail.com'
);
