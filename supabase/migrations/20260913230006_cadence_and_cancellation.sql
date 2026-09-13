-- Replace the fixed monthly/annual renewal_date with a computed model:
-- billing_cycle gains more cadences, renewal_date goes away (the app
-- computes "next renewal" from start_date + billing_cycle), and end_date
-- supports tracking a cancelled-but-still-active subscription.

alter table public.subscriptions
  drop constraint if exists subscriptions_billing_cycle_check;

update public.subscriptions
  set billing_cycle = 'yearly'
  where billing_cycle = 'annual';

alter table public.subscriptions
  add constraint subscriptions_billing_cycle_check
  check (billing_cycle in ('daily', 'weekly', 'monthly', 'quarterly', 'yearly'));

alter table public.subscriptions
  drop column if exists renewal_date;

alter table public.subscriptions
  add column if not exists end_date date;
