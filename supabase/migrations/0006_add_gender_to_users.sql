alter table users
  add column if not exists gender text check (gender in ('Male', 'Female'));
