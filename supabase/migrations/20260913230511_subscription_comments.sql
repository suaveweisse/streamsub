-- A comment thread per subscription (like ticketing-system comments):
-- multiple timestamped, independently editable/deletable entries instead
-- of one overwritable notes field.
create table if not exists public.subscription_comments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  author_id uuid references auth.users (id) default auth.uid(),
  author_email text default (auth.jwt() ->> 'email'),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscription_comments_subscription_id_idx
  on public.subscription_comments (subscription_id);

drop trigger if exists subscription_comments_set_updated_at on public.subscription_comments;
create trigger subscription_comments_set_updated_at
  before update on public.subscription_comments
  for each row
  execute function public.set_updated_at();

alter table public.subscription_comments enable row level security;

-- Same convention as subscriptions: any signed-in family member can
-- read/add/edit/delete any comment, not just their own.
create policy "authenticated can select comments"
  on public.subscription_comments for select
  to authenticated
  using (true);

create policy "authenticated can insert comments"
  on public.subscription_comments for insert
  to authenticated
  with check (true);

create policy "authenticated can update comments"
  on public.subscription_comments for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete comments"
  on public.subscription_comments for delete
  to authenticated
  using (true);
