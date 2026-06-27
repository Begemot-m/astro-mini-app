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
