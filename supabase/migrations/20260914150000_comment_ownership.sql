-- Close an RLS gap: insert policies used `with check (true)`, so a
-- direct API call could set created_by/author_id/author_email to
-- someone else's identity instead of the server-derived default.
-- Also changes comment permissions: previously any signed-in family
-- member could edit or delete any comment; now only the comment's own
-- author can.

drop policy if exists "authenticated can insert subscriptions" on public.subscriptions;
create policy "authenticated can insert subscriptions"
  on public.subscriptions for insert
  to authenticated
  with check (created_by = auth.uid());

drop policy if exists "authenticated can insert comments" on public.subscription_comments;
create policy "authenticated can insert comments"
  on public.subscription_comments for insert
  to authenticated
  with check (author_id = auth.uid());

drop policy if exists "authenticated can update comments" on public.subscription_comments;
create policy "authors can update own comments"
  on public.subscription_comments for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists "authenticated can delete comments" on public.subscription_comments;
create policy "authors can delete own comments"
  on public.subscription_comments for delete
  to authenticated
  using (author_id = auth.uid());
