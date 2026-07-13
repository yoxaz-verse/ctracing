-- Cleanup accidental tables copied from another project.
-- This intentionally keeps all TeraTrace marketplace, auth, profile, project,
-- and estimator tables intact.

-- Preview data that will be removed, without failing if a table is absent.
-- Supabase SQL Editor shows these as NOTICE messages.
do $$
declare
  target_table text;
  target_regclass regclass;
  target_count bigint;
begin
  foreach target_table in array array[
    'public.industry_intelligence_opportunities',
    'public.industry_intelligence_fetch_runs',
    'public.industry_intelligence_sources'
  ]
  loop
    target_regclass := to_regclass(target_table);
    target_count := null;

    if target_regclass is not null then
      execute format('select count(*) from %s', target_regclass)
        into target_count;
      raise notice '% rows: %', target_table, target_count;
    else
      raise notice '% does not exist', target_table;
    end if;
  end loop;
end $$;

begin;

-- Drop dependent table first, then parent tables.
drop table if exists public.industry_intelligence_opportunities cascade;
drop table if exists public.industry_intelligence_fetch_runs cascade;
drop table if exists public.industry_intelligence_sources cascade;

commit;

-- Verification: this should return zero rows.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name like 'industry_intelligence_%'
order by table_name;
