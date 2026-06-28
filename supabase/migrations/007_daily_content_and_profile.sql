-- Аддитивная миграция: ежедневный кэш контента главной + имя пользователя.

-- 1. Кэш дневного контента (прогноз, сферы, неделя/месяц) — одна генерация в день на юзера.
create table if not exists public.daily_content (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_date date not null,
  content jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, content_date)
);

alter table public.daily_content enable row level security;

create policy "users read own daily content" on public.daily_content
  for select using (auth.uid() = user_id);
-- Запись только через service role (функция daily-content).

create index if not exists daily_content_user_date_idx
  on public.daily_content(user_id, content_date desc);

-- 2. Отображаемое имя пользователя (вводит сам, может менять).
alter table public.telegram_accounts
  add column if not exists display_name text;
