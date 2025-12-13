-- /db/schema.sql
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  stripe_customer_id text,
  plan text default 'free',
  status text default 'inactive',
  created_at timestamp with time zone default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  input jsonb,
  output jsonb,
  created_at timestamp with time zone default now()
);

-- Track API usage for free users (quota: 5 calls per 24 hours, reset daily at 00:00 +8 GMT)
create table if not exists api_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  usage_date date,
  call_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, usage_date)
);