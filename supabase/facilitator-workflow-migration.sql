-- Facilitator workflow expansion for TeraTrace.
-- Adds facilitator role, managed participants, assignments, match opportunities, and facilitator messages.

alter type public.user_role add value if not exists 'facilitator';

create table if not exists public.facilitator_managed_participants (
  id uuid primary key default gen_random_uuid(),
  facilitator_id uuid not null references public.profiles(id) on delete cascade,
  participant_type text not null check (participant_type in ('buyer', 'seller')),
  linked_profile_id uuid references public.profiles(id) on delete set null,
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  country text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.facilitator_assignments (
  id uuid primary key default gen_random_uuid(),
  facilitator_id uuid not null references public.profiles(id) on delete cascade,
  assignment_scope text not null check (assignment_scope in ('buyer', 'seller', 'project', 'interest', 'opportunity')),
  target_id uuid not null,
  assigned_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  unique (facilitator_id, assignment_scope, target_id)
);

create table if not exists public.facilitator_opportunities (
  id uuid primary key default gen_random_uuid(),
  facilitator_id uuid not null references public.profiles(id) on delete cascade,
  buyer_profile_id uuid references public.profiles(id) on delete set null,
  seller_profile_id uuid references public.profiles(id) on delete set null,
  buyer_participant_id uuid references public.facilitator_managed_participants(id) on delete set null,
  seller_participant_id uuid references public.facilitator_managed_participants(id) on delete set null,
  project_id uuid references public.carbon_projects(id) on delete set null,
  interest_id uuid references public.buyer_interests(id) on delete set null,
  title text not null,
  requested_credits integer check (requested_credits is null or requested_credits > 0),
  fit_score integer not null default 50 check (fit_score between 0 and 100),
  stage text not null default 'draft'
    check (stage in ('draft', 'screening', 'buyer_contacted', 'seller_contacted', 'matched', 'negotiation', 'closed_won', 'closed_lost')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  facilitator_notes text,
  next_action text,
  closed_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.facilitator_messages (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.facilitator_opportunities(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message_body text not null,
  created_at timestamptz not null default now()
);

alter table public.facilitator_managed_participants enable row level security;
alter table public.facilitator_assignments enable row level security;
alter table public.facilitator_opportunities enable row level security;
alter table public.facilitator_messages enable row level security;

drop trigger if exists facilitator_managed_participants_set_updated_at on public.facilitator_managed_participants;
create trigger facilitator_managed_participants_set_updated_at
  before update on public.facilitator_managed_participants
  for each row execute function public.set_updated_at();

drop trigger if exists facilitator_opportunities_set_updated_at on public.facilitator_opportunities;
create trigger facilitator_opportunities_set_updated_at
  before update on public.facilitator_opportunities
  for each row execute function public.set_updated_at();

create or replace function public.can_access_facilitator_opportunity(opportunity_id_input uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.facilitator_opportunities fo
     where fo.id = opportunity_id_input
       and (
         fo.facilitator_id = auth.uid()
         or fo.buyer_profile_id = auth.uid()
         or fo.seller_profile_id = auth.uid()
         or public.current_user_role()::text = 'admin'
       )
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
         or exists (
           select 1 from public.facilitator_assignments fa
            where fa.facilitator_id = auth.uid()
              and fa.assignment_scope = 'interest'
              and fa.target_id = bi.id
         )
         or exists (
           select 1 from public.facilitator_opportunities fo
            where fo.facilitator_id = auth.uid()
              and fo.interest_id = bi.id
         )
       )
  )
$$;

grant execute on function public.can_access_facilitator_opportunity(uuid) to authenticated;
grant execute on function public.can_access_interest(uuid) to authenticated;

drop policy if exists "Profiles are readable by their owner" on public.profiles;
create policy "Profiles are readable by their owner"
  on public.profiles for select
  using (
    auth.uid() = id
    or public.current_user_role()::text = 'admin'
    or (
      public.current_user_role()::text = 'facilitator'
      and role::text in ('buyer', 'seller', 'facilitator')
    )
  );

drop policy if exists "Buyers can read their own interests" on public.buyer_interests;
create policy "Buyers can read their own interests"
  on public.buyer_interests for select
  to authenticated
  using (
    buyer_id = auth.uid()
    or public.current_user_role()::text in ('admin', 'facilitator')
    or exists (
      select 1 from public.carbon_projects
      where carbon_projects.id = buyer_interests.project_id
      and carbon_projects.seller_id = auth.uid()
    )
  );

drop policy if exists "Facilitators can manage owned participants" on public.facilitator_managed_participants;
create policy "Facilitators can manage owned participants"
  on public.facilitator_managed_participants for all
  to authenticated
  using (facilitator_id = auth.uid() or public.current_user_role()::text = 'admin')
  with check (
    (facilitator_id = auth.uid() and public.current_user_role()::text = 'facilitator')
    or public.current_user_role()::text = 'admin'
  );

drop policy if exists "Facilitators can manage assignments" on public.facilitator_assignments;
create policy "Facilitators can manage assignments"
  on public.facilitator_assignments for all
  to authenticated
  using (facilitator_id = auth.uid() or public.current_user_role()::text = 'admin')
  with check (
    (facilitator_id = auth.uid() and public.current_user_role()::text = 'facilitator')
    or public.current_user_role()::text = 'admin'
  );

drop policy if exists "Facilitator opportunities are participant readable" on public.facilitator_opportunities;
create policy "Facilitator opportunities are participant readable"
  on public.facilitator_opportunities for select
  to authenticated
  using (
    facilitator_id = auth.uid()
    or buyer_profile_id = auth.uid()
    or seller_profile_id = auth.uid()
    or public.current_user_role()::text = 'admin'
  );

drop policy if exists "Facilitators can create opportunities" on public.facilitator_opportunities;
create policy "Facilitators can create opportunities"
  on public.facilitator_opportunities for insert
  to authenticated
  with check (
    facilitator_id = auth.uid()
    and public.current_user_role()::text = 'facilitator'
  );

drop policy if exists "Facilitators can update owned opportunities" on public.facilitator_opportunities;
create policy "Facilitators can update owned opportunities"
  on public.facilitator_opportunities for update
  to authenticated
  using (facilitator_id = auth.uid() or public.current_user_role()::text = 'admin')
  with check (facilitator_id = auth.uid() or public.current_user_role()::text = 'admin');

drop policy if exists "Facilitator messages are opportunity readable" on public.facilitator_messages;
create policy "Facilitator messages are opportunity readable"
  on public.facilitator_messages for select
  to authenticated
  using (public.can_access_facilitator_opportunity(opportunity_id));

drop policy if exists "Facilitators can send opportunity messages" on public.facilitator_messages;
create policy "Facilitators can send opportunity messages"
  on public.facilitator_messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.facilitator_opportunities fo
       where fo.id = opportunity_id
         and fo.facilitator_id = auth.uid()
    )
  );
