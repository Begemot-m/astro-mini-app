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
