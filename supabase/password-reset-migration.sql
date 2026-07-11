-- Custom SMTP password reset support for TeraTrace.
-- Tokens are written/read by server-side service-role code only.

create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.password_reset_tokens enable row level security;
