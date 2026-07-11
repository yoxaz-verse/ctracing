-- Public-safe homepage summary for TeraTrace.
-- This exposes aggregate marketplace data and project preview fields only.

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
