create table if not exists public.birth_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birth_date date not null,
  birth_time time,
  time_unknown boolean not null default false,
  place_name text not null,
  lat double precision,
  lon double precision,
  timezone text,
  consented_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.charts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  chart_json jsonb not null,
  engine_version text not null,
  computed_at timestamptz not null default now()
);

create table if not exists public.interpretations (
  user_id uuid references auth.users(id) on delete cascade,
  kind text not null,
  content jsonb not null,
  model text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, kind)
);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null check (provider in ('yookassa', 'stars')),
  status text not null,
  plan text not null,
  external_id text,
  payment_method_id text,
  receipt_email text,
  auto_renew boolean not null default false,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.birth_data enable row level security;
alter table public.charts enable row level security;
alter table public.interpretations enable row level security;
alter table public.subscriptions enable row level security;

create policy "users manage own birth data" on public.birth_data for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users read own charts" on public.charts for select using (auth.uid() = user_id);
create policy "users read own interpretations" on public.interpretations for select using (auth.uid() = user_id);
create policy "users read own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);
