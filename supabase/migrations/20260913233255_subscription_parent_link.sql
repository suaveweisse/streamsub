-- Lets a subscription be bundled under another (e.g. Netflix included via
-- a T-Mobile plan, Peacock via DirecTV). Self-referential and nullable;
-- losing the parent just unlinks the child rather than deleting it.
alter table public.subscriptions
  add column if not exists parent_subscription_id uuid references public.subscriptions (id) on delete set null;

create index if not exists subscriptions_parent_subscription_id_idx
  on public.subscriptions (parent_subscription_id);
