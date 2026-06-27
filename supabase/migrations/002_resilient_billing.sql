create table if not exists public.payment_events (
  id text primary key,
  event_type text not null,
  provider text not null default 'yookassa',
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text
);

create table if not exists public.subscription_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  provider text not null,
  external_payment_id text not null unique,
  plan text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  amount numeric(10,2) not null,
  currency text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  document_key text not null,
  document_version text not null,
  accepted_at timestamptz not null default now(),
  unique(user_id, document_key, document_version)
);

create table if not exists public.features (
  key text primary key,
  enabled boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.payment_events enable row level security;
alter table public.subscription_periods enable row level security;
alter table public.user_consents enable row level security;
alter table public.features enable row level security;

create policy "users read own subscription periods" on public.subscription_periods for select using (auth.uid() = user_id);
create policy "users read own consents" on public.user_consents for select using (auth.uid() = user_id);
create policy "users create own consents" on public.user_consents for insert with check (auth.uid() = user_id);
create policy "authenticated read enabled features" on public.features for select to authenticated using (enabled = true);
