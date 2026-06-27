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
