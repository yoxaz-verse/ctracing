-- Company profile and verification fields for buyer/seller onboarding.

alter table public.profiles
  add column if not exists company_location text,
  add column if not exists incorporated_on date,
  add column if not exists gstin text,
  add column if not exists gst_details text,
  add column if not exists registration_type text,
  add column if not exists registration_number text,
  add column if not exists annual_credit_demand integer,
  add column if not exists preferred_project_types text,
  add column if not exists carbon_purchase_goal text,
  add column if not exists annual_credit_supply integer,
  add column if not exists project_methodologies text,
  add column if not exists registry_experience text,
  add column if not exists company_verification_status text not null default 'pending',
  add column if not exists company_verified_at timestamptz,
  add column if not exists company_verified_by uuid references public.profiles(id) on delete set null,
  add column if not exists company_verification_note text;

update public.profiles
   set company_verification_status = 'pending'
 where company_verification_status is null
    or company_verification_status not in ('pending', 'verified', 'needs_update');

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_registration_type_check'
  ) then
    alter table public.profiles
      add constraint profiles_registration_type_check
      check (registration_type is null or registration_type in ('cin', 'ngo', 'other'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_annual_credit_demand_check'
  ) then
    alter table public.profiles
      add constraint profiles_annual_credit_demand_check
      check (annual_credit_demand is null or annual_credit_demand >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_annual_credit_supply_check'
  ) then
    alter table public.profiles
      add constraint profiles_annual_credit_supply_check
      check (annual_credit_supply is null or annual_credit_supply >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_company_verification_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_company_verification_status_check
      check (company_verification_status in ('pending', 'verified', 'needs_update'));
  end if;
end $$;

drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.current_user_role()::text = 'admin')
  with check (auth.uid() = id or public.current_user_role()::text = 'admin');

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

drop trigger if exists profiles_protect_company_verification_fields on public.profiles;
create trigger profiles_protect_company_verification_fields
  before update on public.profiles
  for each row execute function public.protect_company_verification_fields();
