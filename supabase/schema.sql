create type public.user_role as enum ('buyer', 'seller');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role public.user_role not null,
  company_name text,
  email_verified_at timestamptz,
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

create table public.carbon_projects (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  project_name text not null,
  location text not null,
  methodology text not null,
  available_credits integer not null check (available_credits >= 0),
  price_per_credit numeric(10, 2) not null check (price_per_credit >= 0),
  verification_status text not null default 'Documentation review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.buyer_interests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.carbon_projects(id) on delete cascade,
  requested_credits integer not null check (requested_credits > 0),
  status text not null default 'Reviewing project documentation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.email_verification_tokens enable row level security;
alter table public.carbon_projects enable row level security;
alter table public.buyer_interests enable row level security;

create policy "Profiles are readable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

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
  using (true);

create policy "Sellers can insert their own projects"
  on public.carbon_projects for insert
  to authenticated
  with check (
    seller_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'seller'
    )
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

create policy "Buyers can read their own interests"
  on public.buyer_interests for select
  to authenticated
  using (
    buyer_id = auth.uid()
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
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'buyer'
    )
  );

create policy "Buyers can update their own interests"
  on public.buyer_interests for update
  to authenticated
  using (buyer_id = auth.uid())
  with check (buyer_id = auth.uid());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger carbon_projects_set_updated_at
  before update on public.carbon_projects
  for each row execute function public.set_updated_at();

create trigger buyer_interests_set_updated_at
  before update on public.buyer_interests
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
