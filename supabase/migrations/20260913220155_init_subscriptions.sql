-- Subscriptions tracked by the family.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  service_name text not null,
  payment_source text,
  cost numeric(10, 2) not null default 0,
  billing_cycle text not null check (billing_cycle in ('monthly', 'annual')),
  start_date date,
  renewal_date date,
  account_email text,
  account_username text,
  account_password text,
  created_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row
  execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

-- Every signed-in family member can see and manage every subscription
-- (this is a shared household tracker, not per-user private data).
-- Cloudflare Access is the gate that keeps non-family members off the
-- page in the first place; these policies only require a valid Supabase
-- Auth session (role = authenticated), not ownership of the row.
create policy "authenticated can select subscriptions"
  on public.subscriptions for select
  to authenticated
  using (true);

create policy "authenticated can insert subscriptions"
  on public.subscriptions for insert
  to authenticated
  with check (true);

create policy "authenticated can update subscriptions"
  on public.subscriptions for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete subscriptions"
  on public.subscriptions for delete
  to authenticated
  using (true);
