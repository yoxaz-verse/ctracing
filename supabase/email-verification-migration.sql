alter table public.profiles
  add column if not exists email_verified_at timestamptz;

create table if not exists public.email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.email_verification_tokens enable row level security;

drop policy if exists "Users can read their own verification status"
  on public.email_verification_tokens;
drop policy if exists "Users can create their own verification tokens"
  on public.email_verification_tokens;
drop policy if exists "Users can expire their own verification tokens"
  on public.email_verification_tokens;

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
