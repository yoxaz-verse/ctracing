-- Production workflow expansion for TeraTrace.
-- Adds lifecycle, review, documentation, messaging, notifications, and audit records.

alter table public.profiles
  add column if not exists contact_name text,
  add column if not exists website text,
  add column if not exists country text,
  add column if not exists onboarding_completed_at timestamptz;

alter table public.carbon_projects
  add column if not exists lifecycle_status text not null default 'draft'
    check (lifecycle_status in ('draft', 'submitted', 'needs_review', 'listed', 'paused', 'archived')),
  add column if not exists project_description text,
  add column if not exists estimated_annual_credits integer check (estimated_annual_credits is null or estimated_annual_credits >= 0),
  add column if not exists vintage_year integer check (vintage_year is null or vintage_year between 1990 and 2100),
  add column if not exists registry_name text,
  add column if not exists documentation_score integer not null default 0 check (documentation_score between 0 and 100);

alter table public.buyer_interests
  add column if not exists buyer_note text,
  add column if not exists seller_response_note text,
  add column if not exists updated_by uuid references public.profiles(id) on delete set null;

alter table public.buyer_interests
  alter column status set default 'submitted';

update public.buyer_interests
   set status = 'submitted'
 where status not in ('submitted', 'seller_review', 'more_info_requested', 'qualified', 'closed');

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'buyer_interests_status_lifecycle_check'
  ) then
    alter table public.buyer_interests
      add constraint buyer_interests_status_lifecycle_check
      check (status in ('submitted', 'seller_review', 'more_info_requested', 'qualified', 'closed'));
  end if;
end $$;

create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.carbon_projects(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  document_name text not null,
  document_category text not null default 'Project documentation',
  document_url text,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'accepted', 'needs_update')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.carbon_projects(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  decision_status text not null
    check (decision_status in ('needs_review', 'listed', 'paused', 'archived')),
  review_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_projects (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.carbon_projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (buyer_id, project_id)
);

create table if not exists public.marketplace_messages (
  id uuid primary key default gen_random_uuid(),
  interest_id uuid not null references public.buyer_interests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message_body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.project_documents enable row level security;
alter table public.project_reviews enable row level security;
alter table public.saved_projects enable row level security;
alter table public.marketplace_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

drop trigger if exists project_documents_set_updated_at on public.project_documents;
create trigger project_documents_set_updated_at
  before update on public.project_documents
  for each row execute function public.set_updated_at();

create or replace function public.is_project_seller(project_id_input uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.carbon_projects
     where id = project_id_input
       and seller_id = auth.uid()
  )
$$;

create or replace function public.can_access_interest(interest_id_input uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.buyer_interests bi
      join public.carbon_projects cp on cp.id = bi.project_id
     where bi.id = interest_id_input
       and (
         bi.buyer_id = auth.uid()
         or cp.seller_id = auth.uid()
         or public.current_user_role()::text = 'admin'
       )
  )
$$;

create or replace function public.record_audit(
  action_input text,
  entity_type_input text,
  entity_id_input uuid default null,
  metadata_input jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), action_input, entity_type_input, entity_id_input, coalesce(metadata_input, '{}'::jsonb));
end;
$$;

grant execute on function public.is_project_seller(uuid) to authenticated;
grant execute on function public.can_access_interest(uuid) to authenticated;
grant execute on function public.record_audit(text, text, uuid, jsonb) to authenticated;

drop policy if exists "Sellers can insert their own projects" on public.carbon_projects;
drop policy if exists "Sellers can update their own projects" on public.carbon_projects;
drop policy if exists "Sellers and admins can update projects" on public.carbon_projects;
drop policy if exists "Authenticated users can read listed carbon projects" on public.carbon_projects;
drop policy if exists "Buyers can update their own interests" on public.buyer_interests;
drop policy if exists "Buyers sellers and admins can update accessible interests" on public.buyer_interests;
drop policy if exists "Project documents are readable by sellers and admins" on public.project_documents;
drop policy if exists "Sellers can insert project documents" on public.project_documents;
drop policy if exists "Sellers can update project documents" on public.project_documents;
drop policy if exists "Project reviews are admin readable" on public.project_reviews;
drop policy if exists "Admins can insert project reviews" on public.project_reviews;
drop policy if exists "Buyers can read saved projects" on public.saved_projects;
drop policy if exists "Buyers can save projects" on public.saved_projects;
drop policy if exists "Buyers can unsave projects" on public.saved_projects;
drop policy if exists "Interest participants can read messages" on public.marketplace_messages;
drop policy if exists "Interest participants can send messages" on public.marketplace_messages;
drop policy if exists "Users can read their notifications" on public.notifications;
drop policy if exists "Users can update their notifications" on public.notifications;
drop policy if exists "Admins can insert notifications" on public.notifications;
drop policy if exists "Admins can read audit logs" on public.audit_logs;

create policy "Authenticated users can read listed carbon projects"
  on public.carbon_projects for select
  to authenticated
  using (lifecycle_status in ('listed', 'submitted', 'needs_review') or seller_id = auth.uid() or public.current_user_role()::text = 'admin');

create policy "Sellers can insert their own projects"
  on public.carbon_projects for insert
  to authenticated
  with check (
    seller_id = auth.uid()
    and public.current_user_role() = 'seller'
  );

create policy "Sellers and admins can update projects"
  on public.carbon_projects for update
  to authenticated
  using (seller_id = auth.uid() or public.current_user_role()::text = 'admin')
  with check (seller_id = auth.uid() or public.current_user_role()::text = 'admin');

create policy "Buyers sellers and admins can update accessible interests"
  on public.buyer_interests for update
  to authenticated
  using (
    buyer_id = auth.uid()
    or exists (
      select 1 from public.carbon_projects
      where carbon_projects.id = buyer_interests.project_id
      and carbon_projects.seller_id = auth.uid()
    )
    or public.current_user_role()::text = 'admin'
  )
  with check (
    buyer_id = auth.uid()
    or exists (
      select 1 from public.carbon_projects
      where carbon_projects.id = buyer_interests.project_id
      and carbon_projects.seller_id = auth.uid()
    )
    or public.current_user_role()::text = 'admin'
  );

create policy "Project documents are readable by sellers and admins"
  on public.project_documents for select
  to authenticated
  using (public.is_project_seller(project_id) or public.current_user_role()::text = 'admin');

create policy "Sellers can insert project documents"
  on public.project_documents for insert
  to authenticated
  with check (uploaded_by = auth.uid() and public.is_project_seller(project_id));

create policy "Sellers can update project documents"
  on public.project_documents for update
  to authenticated
  using (uploaded_by = auth.uid() or public.current_user_role()::text = 'admin')
  with check (uploaded_by = auth.uid() or public.current_user_role()::text = 'admin');

create policy "Project reviews are admin readable"
  on public.project_reviews for select
  to authenticated
  using (public.current_user_role()::text = 'admin' or public.is_project_seller(project_id));

create policy "Admins can insert project reviews"
  on public.project_reviews for insert
  to authenticated
  with check (reviewer_id = auth.uid() and public.current_user_role()::text = 'admin');

create policy "Buyers can read saved projects"
  on public.saved_projects for select
  to authenticated
  using (buyer_id = auth.uid() or public.current_user_role()::text = 'admin');

create policy "Buyers can save projects"
  on public.saved_projects for insert
  to authenticated
  with check (buyer_id = auth.uid() and public.current_user_role() = 'buyer');

create policy "Buyers can unsave projects"
  on public.saved_projects for delete
  to authenticated
  using (buyer_id = auth.uid());

create policy "Interest participants can read messages"
  on public.marketplace_messages for select
  to authenticated
  using (public.can_access_interest(interest_id));

create policy "Interest participants can send messages"
  on public.marketplace_messages for insert
  to authenticated
  with check (sender_id = auth.uid() and public.can_access_interest(interest_id));

create policy "Users can read their notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid() or public.current_user_role()::text = 'admin');

create policy "Users can update their notifications"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Admins can insert notifications"
  on public.notifications for insert
  to authenticated
  with check (public.current_user_role()::text = 'admin' or user_id = auth.uid());

create policy "Admins can read audit logs"
  on public.audit_logs for select
  to authenticated
  using (public.current_user_role()::text = 'admin');

create or replace function public.homepage_marketplace_summary()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with summary as (
    select
      coalesce(sum(available_credits), 0)::integer as total_credits,
      count(*)::integer as project_count,
      count(
        distinct nullif(
          trim(
            case
              when position(',' in location) > 0 then split_part(location, ',', 2)
              else location
            end
          ),
          ''
        )
      )::integer as region_count,
      count(distinct verification_status)::integer as verification_status_count,
      coalesce(round(avg(price_per_credit)), 0)::integer as average_price
    from public.carbon_projects
    where lifecycle_status = 'listed'
  ),
  latest_projects as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'project_name', project_name,
          'location', location,
          'methodology', methodology,
          'available_credits', available_credits,
          'price_per_credit', price_per_credit,
          'verification_status', verification_status
        )
        order by created_at desc
      ),
      '[]'::jsonb
    ) as projects
    from (
      select
        project_name,
        location,
        methodology,
        available_credits,
        price_per_credit,
        verification_status,
        created_at
      from public.carbon_projects
      where lifecycle_status = 'listed'
      order by created_at desc
      limit 5
    ) recent
  )
  select jsonb_build_object(
    'total_credits', summary.total_credits,
    'project_count', summary.project_count,
    'region_count', summary.region_count,
    'verification_status_count', summary.verification_status_count,
    'average_price', summary.average_price,
    'latest_projects', latest_projects.projects
  )
  from summary, latest_projects;
$$;

grant execute on function public.homepage_marketplace_summary() to anon;
grant execute on function public.homepage_marketplace_summary() to authenticated;
