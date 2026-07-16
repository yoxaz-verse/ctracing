create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  excerpt text not null,
  body text not null,
  cover_image_url text,
  tags text[] not null default '{}'::text[],
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index if not exists blog_posts_slug_unique
  on public.blog_posts (slug);

create index if not exists blog_posts_status_published_at_idx
  on public.blog_posts (status, published_at desc);

alter table public.blog_posts enable row level security;

create or replace function public.touch_blog_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_touch_updated_at on public.blog_posts;
create trigger blog_posts_touch_updated_at
  before update on public.blog_posts
  for each row
  execute function public.touch_blog_posts_updated_at();

drop policy if exists "Published blog posts are public readable" on public.blog_posts;
create policy "Published blog posts are public readable"
  on public.blog_posts for select
  using (status = 'published');

drop policy if exists "Admins can read all blog posts" on public.blog_posts;
create policy "Admins can read all blog posts"
  on public.blog_posts for select
  to authenticated
  using (public.current_user_role()::text = 'admin');

drop policy if exists "Admins can create blog posts" on public.blog_posts;
create policy "Admins can create blog posts"
  on public.blog_posts for insert
  to authenticated
  with check (
    public.current_user_role()::text = 'admin'
    and author_id = auth.uid()
  );

drop policy if exists "Admins can update blog posts" on public.blog_posts;
create policy "Admins can update blog posts"
  on public.blog_posts for update
  to authenticated
  using (public.current_user_role()::text = 'admin')
  with check (public.current_user_role()::text = 'admin');

drop policy if exists "Admins can delete blog posts" on public.blog_posts;
create policy "Admins can delete blog posts"
  on public.blog_posts for delete
  to authenticated
  using (public.current_user_role()::text = 'admin');
