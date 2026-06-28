
-- ====== 001_initial.sql ======
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


-- ====== 002_resilient_billing.sql ======
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


-- ====== 003_entitlements_and_features.sql ======
create or replace view public.active_entitlements
with (security_invoker = true)
as
select
  user_id,
  max(ends_at) as active_until,
  bool_or(ends_at > now()) as is_active
from public.subscription_periods
group by user_id;

insert into public.features (key, enabled, payload) values
  ('payments_live', false, '{"provider":"yookassa"}'::jsonb),
  ('claude_live', false, '{}'::jsonb),
  ('chart_calc_live', false, '{}'::jsonb),
  ('weekly_forecast', false, '{}'::jsonb)
on conflict (key) do nothing;

create index if not exists subscription_periods_user_ends_idx on public.subscription_periods(user_id, ends_at desc);
create index if not exists payment_events_received_idx on public.payment_events(received_at desc);
create index if not exists interpretations_user_created_idx on public.interpretations(user_id, created_at desc);


-- ====== 004_usage_and_billing_hardening.sql ======
-- Аддитивная миграция: учёт неудачных продлений и лимиты AI-запросов.
-- Ничего не удаляет и не переименовывает.

-- 1. Учёт отказов автопродления (используется renew-subscriptions).
alter table public.subscriptions
  add column if not exists failed_attempts integer not null default 0,
  add column if not exists last_renew_error text;

-- 2. Счётчик AI-запросов по пользователю и календарному месяцу.
--    Источник истины для server-side лимитов free/Астро+ (закрывает H1).
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_month date not null,            -- первый день месяца, напр. 2026-06-01
  kind text not null,                    -- 'universe_answer', 'portrait', ...
  used integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, period_month, kind)
);

alter table public.ai_usage enable row level security;

-- Пользователь видит только свой расход (для отображения «осталось вопросов»).
create policy "users read own ai usage" on public.ai_usage
  for select using (auth.uid() = user_id);
-- Запись только через service role (Edge Functions), не из frontend.

create index if not exists ai_usage_user_period_idx on public.ai_usage(user_id, period_month);

-- 3. Атомарный инкремент с проверкой лимита.
--    Возвращает true, если запрос разрешён (и увеличивает счётчик), иначе false.
create or replace function public.consume_ai_quota(
  p_user_id uuid,
  p_kind text,
  p_limit integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month date := date_trunc('month', now())::date;
  v_used integer;
begin
  insert into public.ai_usage (user_id, period_month, kind, used)
  values (p_user_id, v_month, p_kind, 0)
  on conflict (user_id, period_month, kind) do nothing;

  select used into v_used
  from public.ai_usage
  where user_id = p_user_id and period_month = v_month and kind = p_kind
  for update;

  if v_used >= p_limit then
    return false;
  end if;

  update public.ai_usage
  set used = used + 1, updated_at = now()
  where user_id = p_user_id and period_month = v_month and kind = p_kind;

  return true;
end;
$$;


-- ====== 005_telegram_accounts.sql ======
-- Аддитивная миграция: связь Telegram-аккаунта с пользователем Supabase.
-- Маппинг tg_id -> auth.users.id, чтобы при каждом входе находить того же пользователя.

create table if not exists public.telegram_accounts (
  tg_id bigint primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text,
  first_name text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);

alter table public.telegram_accounts enable row level security;
-- Пишется только service role (функция auth-telegram). Пользователю прямой доступ не нужен.


-- ====== 006_answer_history.sql ======
-- Аддитивная миграция: история ответов Вселенной.
-- Отдельная таблица, т.к. interpretations имеет PK (user_id, kind) и хранит лишь последний.

create table if not exists public.answer_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'universe_answer',
  question text,
  title text,
  summary text,
  created_at timestamptz not null default now()
);

alter table public.answer_history enable row level security;

-- Пользователь видит только свою историю.
create policy "users read own answer history" on public.answer_history
  for select using (auth.uid() = user_id);
-- Запись только через service role (функция interpret).

create index if not exists answer_history_user_created_idx
  on public.answer_history(user_id, created_at desc);

