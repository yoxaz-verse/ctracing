-- Run this after the base schema/email verification migration for an existing TeraTrace project.

alter type public.user_role add value if not exists 'admin';

create unique index if not exists buyer_interests_one_per_buyer_project
  on public.buyer_interests (buyer_id, project_id);

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

grant execute on function public.current_user_role() to authenticated;

drop policy if exists "Profiles are readable by their owner" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Profiles are readable by their owner"
  on public.profiles for select
  using (
    auth.uid() = id
    or public.current_user_role()::text = 'admin'
  );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Authenticated users can read listed carbon projects" on public.carbon_projects;
drop policy if exists "Sellers can insert their own projects" on public.carbon_projects;
drop policy if exists "Sellers can update their own projects" on public.carbon_projects;
drop policy if exists "Sellers can delete their own projects" on public.carbon_projects;

create policy "Authenticated users can read listed carbon projects"
  on public.carbon_projects for select
  to authenticated
  using (true);

create policy "Sellers can insert their own projects"
  on public.carbon_projects for insert
  to authenticated
  with check (
    seller_id = auth.uid()
    and public.current_user_role() = 'seller'
  );

create policy "Sellers can update their own projects"
  on public.carbon_projects for update
  to authenticated
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

create policy "Sellers can delete their own projects"
  on public.carbon_projects for delete
  to authenticated
  using (seller_id = auth.uid());

drop policy if exists "Buyers can read their own interests" on public.buyer_interests;
drop policy if exists "Buyers can create their own interests" on public.buyer_interests;
drop policy if exists "Buyers can update their own interests" on public.buyer_interests;

create policy "Buyers can read their own interests"
  on public.buyer_interests for select
  to authenticated
  using (
    buyer_id = auth.uid()
    or public.current_user_role()::text = 'admin'
    or exists (
      select 1 from public.carbon_projects
      where carbon_projects.id = buyer_interests.project_id
      and carbon_projects.seller_id = auth.uid()
    )
  );

create policy "Buyers can create their own interests"
  on public.buyer_interests for insert
  to authenticated
  with check (
    buyer_id = auth.uid()
    and public.current_user_role() = 'buyer'
  );

create policy "Buyers can update their own interests"
  on public.buyer_interests for update
  to authenticated
  using (buyer_id = auth.uid())
  with check (buyer_id = auth.uid());

-- Promote an operator manually after running this migration:
-- update public.profiles set role = 'admin' where email = 'your-email@example.com';
