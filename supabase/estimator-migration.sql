create table if not exists public.project_estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_type text not null,
  registry_pathway text not null,
  methodology_reference text not null,
  country text,
  state text,
  location text,
  input_data_json jsonb not null default '{}'::jsonb,
  assumptions_json jsonb not null default '{}'::jsonb,
  gross_impact_tco2e numeric not null default 0,
  baseline_deduction_tco2e numeric not null default 0,
  leakage_deduction_tco2e numeric not null default 0,
  uncertainty_deduction_tco2e numeric not null default 0,
  buffer_deduction_tco2e numeric not null default 0,
  project_emissions_tco2e numeric not null default 0,
  net_estimated_credits numeric not null default 0,
  estimated_plastic_credits numeric not null default 0,
  estimated_co2e_benefit numeric not null default 0,
  estimated_value numeric not null default 0,
  readiness_score integer not null default 0 check (readiness_score between 0 and 100),
  confidence_level text not null,
  missing_evidence_json jsonb not null default '[]'::jsonb,
  disclaimer_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.emission_factors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  project_type text not null,
  plastic_type text,
  country text,
  region text,
  unit text not null,
  value numeric not null check (value >= 0),
  default_low numeric check (default_low is null or default_low >= 0),
  default_medium numeric check (default_medium is null or default_medium >= 0),
  default_high numeric check (default_high is null or default_high >= 0),
  source_name text,
  source_url text,
  version text,
  is_admin_editable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.methodology_references (
  id uuid primary key default gen_random_uuid(),
  registry text not null,
  methodology_code text not null,
  methodology_name text not null,
  version text not null,
  project_types jsonb not null default '[]'::jsonb,
  source_url text,
  summary text,
  active_status text not null default 'active',
  required_evidence_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (registry, methodology_code, version)
);

create table if not exists public.mrv_evidence (
  id uuid primary key default gen_random_uuid(),
  project_estimate_id uuid not null references public.project_estimates(id) on delete cascade,
  evidence_type text not null,
  file_url text,
  description text,
  geo_location text,
  timestamp timestamptz,
  verification_status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.project_estimates enable row level security;
alter table public.emission_factors enable row level security;
alter table public.methodology_references enable row level security;
alter table public.mrv_evidence enable row level security;

drop policy if exists "Users can read their own project estimates" on public.project_estimates;
create policy "Users can read their own project estimates"
  on public.project_estimates for select
  to authenticated
  using (user_id = auth.uid() or public.current_user_role()::text = 'admin');

drop policy if exists "Users can insert their own project estimates" on public.project_estimates;
create policy "Users can insert their own project estimates"
  on public.project_estimates for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update their own project estimates" on public.project_estimates;
create policy "Users can update their own project estimates"
  on public.project_estimates for update
  to authenticated
  using (user_id = auth.uid() or public.current_user_role()::text = 'admin')
  with check (user_id = auth.uid() or public.current_user_role()::text = 'admin');

drop policy if exists "Authenticated users can read emission factors" on public.emission_factors;
create policy "Authenticated users can read emission factors"
  on public.emission_factors for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage emission factors" on public.emission_factors;
create policy "Admins can manage emission factors"
  on public.emission_factors for all
  to authenticated
  using (public.current_user_role()::text = 'admin')
  with check (public.current_user_role()::text = 'admin');

drop policy if exists "Methodology references are public readable" on public.methodology_references;
create policy "Methodology references are public readable"
  on public.methodology_references for select
  using (true);

drop policy if exists "Admins can manage methodology references" on public.methodology_references;
create policy "Admins can manage methodology references"
  on public.methodology_references for all
  to authenticated
  using (public.current_user_role()::text = 'admin')
  with check (public.current_user_role()::text = 'admin');

drop policy if exists "Users can read their own mrv evidence" on public.mrv_evidence;
create policy "Users can read their own mrv evidence"
  on public.mrv_evidence for select
  to authenticated
  using (
    public.current_user_role()::text = 'admin'
    or exists (
      select 1
      from public.project_estimates pe
      where pe.id = mrv_evidence.project_estimate_id
        and pe.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert evidence for their estimates" on public.mrv_evidence;
create policy "Users can insert evidence for their estimates"
  on public.mrv_evidence for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.project_estimates pe
      where pe.id = mrv_evidence.project_estimate_id
        and pe.user_id = auth.uid()
    )
  );

insert into public.methodology_references (
  registry,
  methodology_code,
  methodology_name,
  version,
  project_types,
  source_url,
  summary,
  active_status,
  required_evidence_json
)
values
  (
    'Verra',
    'VM0047',
    'Afforestation, Reforestation and Revegetation',
    'v1.1',
    '["Afforestation","Reforestation","Revegetation","Agroforestry"]'::jsonb,
    'https://verra.org/methodologies/vm0047/',
    'ARR activities that establish, increase, or restore vegetative cover and quantify carbon removals.',
    'active',
    '["Land tenure","GPS boundary","Baseline evidence","Species plan","Monitoring plan","Leakage/risk assessment"]'::jsonb
  ),
  (
    'Verra',
    'VM0033',
    'Methodology for Tidal Wetland and Seagrass Restoration',
    'v2.1',
    '["Mangrove Restoration"]'::jsonb,
    'https://verra.org/methodologies/vm0033/',
    'Blue-carbon pathway for tidal wetland, seagrass, and mangrove restoration pre-feasibility.',
    'active',
    '["Coastal tenure","GPS boundary","Hydrology assessment","Species plan","Community agreement","Soil/biomass monitoring"]'::jsonb
  ),
  (
    'Verra',
    'PWRM0002',
    'Plastic Waste Recycling Methodology',
    'v1.1',
    '["Plastic Waste Recycling"]'::jsonb,
    'https://verra.org/programs/plastic-waste-reduction-standard/',
    'Quantifies additional eligible plastic waste recycled and estimates Waste Recycling Credits.',
    'active',
    '["Facility registration","Weighbridge slips","Recycler invoice","Baseline recycling data","Traceability"]'::jsonb
  ),
  (
    'Gold Standard',
    'NBS-PATHWAY',
    'Nature-based solutions pathway placeholder',
    'estimate only',
    '["Afforestation","Reforestation","Revegetation","Agroforestry"]'::jsonb,
    'https://www.goldstandard.org/',
    'Alternative registry pathway placeholder; eligibility requires methodology selection and validation.',
    'placeholder',
    '["Methodology selection","Validation pathway","Monitoring plan"]'::jsonb
  )
on conflict (registry, methodology_code, version) do update set
  methodology_name = excluded.methodology_name,
  project_types = excluded.project_types,
  source_url = excluded.source_url,
  summary = excluded.summary,
  active_status = excluded.active_status,
  required_evidence_json = excluded.required_evidence_json,
  updated_at = now();

insert into public.emission_factors (
  name,
  project_type,
  plastic_type,
  unit,
  value,
  default_low,
  default_medium,
  default_high,
  source_name,
  source_url,
  version,
  is_admin_editable
)
values
  ('ARR sequestration default', 'ARR', null, 'tCO2e/ha/year', 6, 3, 6, 10, 'TeraTrace pre-feasibility default', null, 'estimate-only', true),
  ('Mangrove blue carbon default', 'Mangrove Restoration', null, 'tCO2e/ha/year', 10, 5, 10, 15, 'TeraTrace pre-feasibility default', null, 'estimate-only', true),
  ('PET plastic CO2e saving factor', 'Plastic Waste Recycling', 'PET', 'kgCO2e/kg plastic', 1.7, null, null, null, 'TeraTrace pre-feasibility default', null, 'estimate-only', true),
  ('HDPE plastic CO2e saving factor', 'Plastic Waste Recycling', 'HDPE', 'kgCO2e/kg plastic', 1.5, null, null, null, 'TeraTrace pre-feasibility default', null, 'estimate-only', true),
  ('LDPE plastic CO2e saving factor', 'Plastic Waste Recycling', 'LDPE', 'kgCO2e/kg plastic', 1.35, null, null, null, 'TeraTrace pre-feasibility default', null, 'estimate-only', true),
  ('PP plastic CO2e saving factor', 'Plastic Waste Recycling', 'PP', 'kgCO2e/kg plastic', 1.45, null, null, null, 'TeraTrace pre-feasibility default', null, 'estimate-only', true),
  ('Mixed plastic CO2e saving factor', 'Plastic Waste Recycling', 'Mixed plastic', 'kgCO2e/kg plastic', 1.2, null, null, null, 'TeraTrace pre-feasibility default', null, 'estimate-only', true),
  ('Carbon credit price assumption', 'General', null, 'USD/credit', 12, null, null, null, 'TeraTrace pre-feasibility default', null, 'estimate-only', true),
  ('Plastic credit price assumption', 'Plastic Waste Recycling', null, 'USD/MT', 80, null, null, null, 'TeraTrace pre-feasibility default', null, 'estimate-only', true);
