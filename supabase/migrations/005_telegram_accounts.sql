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
