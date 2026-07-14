create type public.user_role as enum ('buyer', 'seller', 'facilitator', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role public.user_role not null,
  company_name text,
  contact_name text,
  website text,
  country text,
  company_location text,
  incorporated_on date,
  gstin text,
  gst_details text,
  registration_type text check (registration_type is null or registration_type in ('cin', 'ngo', 'other')),
  registration_number text,
  annual_credit_demand integer check (annual_credit_demand is null or annual_credit_demand >= 0),
  preferred_project_types text,
  carbon_purchase_goal text,
  annual_credit_supply integer check (annual_credit_supply is null or annual_credit_supply >= 0),
  project_methodologies text,
  registry_experience text,
  company_verification_status text not null default 'pending'
    check (company_verification_status in ('pending', 'verified', 'needs_update')),
  company_verified_at timestamptz,
  company_verified_by uuid references public.profiles(id) on delete set null,
  company_verification_note text,
  email_verified_at timestamptz,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.carbon_projects (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  project_name text not null,
  location text not null,
  methodology text not null,
  available_credits integer not null check (available_credits >= 0),
  price_per_credit numeric(10, 2) not null check (price_per_credit >= 0),
  verification_status text not null default 'Documentation review',
  lifecycle_status text not null default 'draft'
    check (lifecycle_status in ('draft', 'submitted', 'needs_review', 'listed', 'paused', 'archived')),
  project_description text,
  estimated_annual_credits integer check (estimated_annual_credits is null or estimated_annual_credits >= 0),
  vintage_year integer check (vintage_year is null or vintage_year between 1990 and 2100),
  registry_name text,
  documentation_score integer not null default 0 check (documentation_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.buyer_interests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.carbon_projects(id) on delete cascade,
  requested_credits integer not null check (requested_credits > 0),
  status text not null default 'submitted'
    check (status in ('submitted', 'seller_review', 'more_info_requested', 'qualified', 'closed')),
  buyer_note text,
  seller_response_note text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index buyer_interests_one_per_buyer_project
  on public.buyer_interests (buyer_id, project_id);

create table public.project_documents (
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

create table public.project_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.carbon_projects(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  decision_status text not null
    check (decision_status in ('needs_review', 'listed', 'paused', 'archived')),
  review_note text,
  created_at timestamptz not null default now()
);

create table public.saved_projects (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.carbon_projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (buyer_id, project_id)
);

create table public.marketplace_messages (
  id uuid primary key default gen_random_uuid(),
  interest_id uuid not null references public.buyer_interests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message_body text not null,
  created_at timestamptz not null default now()
);

create table public.facilitator_managed_participants (
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

create table public.facilitator_assignments (
  id uuid primary key default gen_random_uuid(),
  facilitator_id uuid not null references public.profiles(id) on delete cascade,
  assignment_scope text not null check (assignment_scope in ('buyer', 'seller', 'project', 'interest', 'opportunity')),
  target_id uuid not null,
  assigned_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  unique (facilitator_id, assignment_scope, target_id)
);

create table public.facilitator_opportunities (
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

create table public.facilitator_messages (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.facilitator_opportunities(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message_body text not null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.email_verification_tokens enable row level security;
alter table public.password_reset_tokens enable row level security;
alter table public.carbon_projects enable row level security;
alter table public.buyer_interests enable row level security;
alter table public.project_documents enable row level security;
alter table public.project_reviews enable row level security;
alter table public.saved_projects enable row level security;
alter table public.marketplace_messages enable row level security;
alter table public.facilitator_managed_participants enable row level security;
alter table public.facilitator_assignments enable row level security;
alter table public.facilitator_opportunities enable row level security;
alter table public.facilitator_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

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
grant execute on function public.can_access_facilitator_opportunity(uuid) to authenticated;
grant execute on function public.record_audit(text, text, uuid, jsonb) to authenticated;

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

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id or public.current_user_role()::text = 'admin')
  with check (auth.uid() = id or public.current_user_role()::text = 'admin');

create policy "Users can read their own verification status"
  on public.email_verification_tokens for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own verification tokens"
  on public.email_verification_tokens for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can expire their own verification tokens"
  on public.email_verification_tokens for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Authenticated users can read listed carbon projects"
  on public.carbon_projects for select
  to authenticated
  using (
    lifecycle_status in ('listed', 'submitted', 'needs_review')
    or seller_id = auth.uid()
    or public.current_user_role()::text = 'admin'
  );

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
  using (seller_id = auth.uid() or public.current_user_role()::text = 'admin')
  with check (seller_id = auth.uid() or public.current_user_role()::text = 'admin');

create policy "Sellers can delete their own projects"
  on public.carbon_projects for delete
  to authenticated
  using (seller_id = auth.uid());

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

create policy "Facilitators can manage owned participants"
  on public.facilitator_managed_participants for all
  to authenticated
  using (facilitator_id = auth.uid() or public.current_user_role()::text = 'admin')
  with check (
    (facilitator_id = auth.uid() and public.current_user_role()::text = 'facilitator')
    or public.current_user_role()::text = 'admin'
  );

create policy "Facilitators can manage assignments"
  on public.facilitator_assignments for all
  to authenticated
  using (facilitator_id = auth.uid() or public.current_user_role()::text = 'admin')
  with check (
    (facilitator_id = auth.uid() and public.current_user_role()::text = 'facilitator')
    or public.current_user_role()::text = 'admin'
  );

create policy "Facilitator opportunities are participant readable"
  on public.facilitator_opportunities for select
  to authenticated
  using (
    facilitator_id = auth.uid()
    or buyer_profile_id = auth.uid()
    or seller_profile_id = auth.uid()
    or public.current_user_role()::text = 'admin'
  );

create policy "Facilitators can create opportunities"
  on public.facilitator_opportunities for insert
  to authenticated
  with check (
    facilitator_id = auth.uid()
    and public.current_user_role()::text = 'facilitator'
  );

create policy "Facilitators can update owned opportunities"
  on public.facilitator_opportunities for update
  to authenticated
  using (facilitator_id = auth.uid() or public.current_user_role()::text = 'admin')
  with check (facilitator_id = auth.uid() or public.current_user_role()::text = 'admin');

create policy "Facilitator messages are opportunity readable"
  on public.facilitator_messages for select
  to authenticated
  using (public.can_access_facilitator_opportunity(opportunity_id));

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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.protect_company_verification_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean := public.current_user_role()::text = 'admin';
  legal_fields_changed boolean := (
    old.company_name is distinct from new.company_name
    or old.company_location is distinct from new.company_location
    or old.contact_name is distinct from new.contact_name
    or old.country is distinct from new.country
    or old.website is distinct from new.website
    or old.incorporated_on is distinct from new.incorporated_on
    or old.gstin is distinct from new.gstin
    or old.gst_details is distinct from new.gst_details
    or old.registration_type is distinct from new.registration_type
    or old.registration_number is distinct from new.registration_number
  );
begin
  if not is_admin then
    new.company_verification_note = old.company_verification_note;

    if old.company_verification_status = 'verified' and legal_fields_changed then
      new.company_verification_status = 'pending';
      new.company_verified_at = null;
      new.company_verified_by = null;
    else
      new.company_verification_status = old.company_verification_status;
      new.company_verified_at = old.company_verified_at;
      new.company_verified_by = old.company_verified_by;
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger profiles_protect_company_verification_fields
  before update on public.profiles
  for each row execute function public.protect_company_verification_fields();

create trigger carbon_projects_set_updated_at
  before update on public.carbon_projects
  for each row execute function public.set_updated_at();

create trigger buyer_interests_set_updated_at
  before update on public.buyer_interests
  for each row execute function public.set_updated_at();

create trigger project_documents_set_updated_at
  before update on public.project_documents
  for each row execute function public.set_updated_at();

create trigger facilitator_managed_participants_set_updated_at
  before update on public.facilitator_managed_participants
  for each row execute function public.set_updated_at();

create trigger facilitator_opportunities_set_updated_at
  before update on public.facilitator_opportunities
  for each row execute function public.set_updated_at();

create or replace function public.verify_teratrace_email(token_hash_input text)
returns table(ok boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_token public.email_verification_tokens%rowtype;
  verified_at timestamptz := now();
begin
  select *
    into matched_token
    from public.email_verification_tokens
   where token_hash = token_hash_input
   limit 1;

  if not found then
    return query select false, 'This verification link is invalid.';
    return;
  end if;

  if matched_token.used_at is not null then
    return query select false, 'This verification link has already been used.';
    return;
  end if;

  if matched_token.expires_at < verified_at then
    return query select false, 'This verification link has expired.';
    return;
  end if;

  update public.profiles
     set email_verified_at = verified_at
   where id = matched_token.user_id;

  update public.email_verification_tokens
     set used_at = verified_at
   where id = matched_token.id;

  return query select true, 'Your email is verified. You can log in now.';
end;
$$;

grant execute on function public.verify_teratrace_email(text) to anon;
grant execute on function public.verify_teratrace_email(text) to authenticated;

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
