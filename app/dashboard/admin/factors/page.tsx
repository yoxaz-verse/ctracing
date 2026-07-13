import { updateEmissionFactor } from "@/app/dashboard/actions";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { PendingButton } from "@/app/_components/PendingButton";
import { defaultFactors } from "@/lib/estimator/config";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { EmissionFactor } from "@/lib/types";

export const dynamic = "force-dynamic";

function fallbackFactors(): EmissionFactor[] {
  return [
    {
      id: "local-arr",
      name: "ARR sequestration defaults",
      project_type: "ARR",
      plastic_type: null,
      country: null,
      region: null,
      unit: "tCO2e/ha/year",
      value: defaultFactors.arrSequestration.Moderate,
      default_low: defaultFactors.arrSequestration.Conservative,
      default_medium: defaultFactors.arrSequestration.Moderate,
      default_high: defaultFactors.arrSequestration.Optimistic,
      source_name: "Local config fallback",
      source_url: null,
      version: "estimate-only",
      is_admin_editable: false,
    },
    {
      id: "local-mangrove",
      name: "Mangrove sequestration defaults",
      project_type: "Mangrove Restoration",
      plastic_type: null,
      country: null,
      region: null,
      unit: "tCO2e/ha/year",
      value: defaultFactors.mangroveSequestration.Moderate,
      default_low: defaultFactors.mangroveSequestration.Conservative,
      default_medium: defaultFactors.mangroveSequestration.Moderate,
      default_high: defaultFactors.mangroveSequestration.Optimistic,
      source_name: "Local config fallback",
      source_url: null,
      version: "estimate-only",
      is_admin_editable: false,
    },
  ];
}

export default async function AdminFactorsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "admin") {
    redirectForRole(profile.role);
  }

  const { data, error } = await supabase
    .from("emission_factors")
    .select(
      "id,name,project_type,plastic_type,country,region,unit,value,default_low,default_medium,default_high,source_name,source_url,version,is_admin_editable,created_at,updated_at",
    )
    .order("project_type", { ascending: true })
    .returns<EmissionFactor[]>();

  const factors = error ? fallbackFactors() : (data ?? []);

  return (
    <DashboardShell profile={profile} activeRole="admin">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Admin factors
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Estimator assumptions and emission factors.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
          Manage default assumptions used by the pre-feasibility calculator.
          These values are estimates, not certification factors.
        </p>
        {params.saved ? (
          <p className="mt-5 rounded-2xl bg-[#eef6ed] px-4 py-3 text-sm text-[#214d35]">
            Factor saved.
          </p>
        ) : null}
        {params.error || error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error ?? "Database factor table is not available yet. Showing local fallback defaults."}
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-5">
        {factors.map((factor) => (
          <form
            key={factor.id}
            action={factor.is_admin_editable ? updateEmissionFactor : undefined}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]"
          >
            <input type="hidden" name="factorId" value={factor.id} />
            <input type="hidden" name="redirectTo" value="/dashboard/admin/factors" />
            <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <h2 className="text-xl font-semibold">{factor.name}</h2>
                <p className="mt-2 text-sm text-[#5b6a61]">
                  {factor.project_type}
                  {factor.plastic_type ? ` · ${factor.plastic_type}` : ""} · {factor.unit}
                </p>
                <p className="mt-2 text-sm text-[#5b6a61]">
                  {factor.source_name ?? "No source"} {factor.version ? `· ${factor.version}` : ""}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["value", "Current value", factor.value],
                  ["defaultLow", "Low", factor.default_low ?? ""],
                  ["defaultMedium", "Medium", factor.default_medium ?? ""],
                  ["defaultHigh", "High", factor.default_high ?? ""],
                ].map(([name, label, value]) => (
                  <label key={name}>
                    <span className="text-sm font-medium text-[#314239]">{label}</span>
                    <input
                      name={String(name)}
                      type="number"
                      min="0"
                      step="any"
                      defaultValue={value}
                      disabled={!factor.is_admin_editable}
                      className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 text-sm"
                    />
                  </label>
                ))}
                <label>
                  <span className="text-sm font-medium text-[#314239]">Source</span>
                  <input
                    name="sourceName"
                    defaultValue={factor.source_name ?? ""}
                    disabled={!factor.is_admin_editable}
                    className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 text-sm"
                  />
                </label>
                <label>
                  <span className="text-sm font-medium text-[#314239]">Version</span>
                  <input
                    name="version"
                    defaultValue={factor.version ?? ""}
                    disabled={!factor.is_admin_editable}
                    className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 text-sm"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-sm font-medium text-[#314239]">Source URL</span>
                  <input
                    name="sourceUrl"
                    defaultValue={factor.source_url ?? ""}
                    disabled={!factor.is_admin_editable}
                    className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 text-sm"
                  />
                </label>
              </div>
            </div>
            {factor.is_admin_editable ? (
              <PendingButton
                idleLabel="Save factor"
                pendingLabel="Saving..."
                className="mt-5 rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
              />
            ) : (
              <p className="mt-5 text-sm text-[#5b6a61]">
                Apply the estimator Supabase migration to edit this factor from the dashboard.
              </p>
            )}
          </form>
        ))}
      </section>
    </DashboardShell>
  );
}
