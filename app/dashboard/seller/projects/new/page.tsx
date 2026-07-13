import Link from "next/link";
import { PendingButton } from "@/app/_components/PendingButton";
import { createProject } from "@/app/dashboard/actions";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { ProjectEstimate } from "@/lib/types";
import { SellerProjectFields } from "../_components/SellerProjectFields";

export const dynamic = "force-dynamic";

export default async function NewSellerProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; estimateId?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const estimate =
    params.estimateId
      ? await supabase
          .from("project_estimates")
          .select(
            "id,user_id,project_type,registry_pathway,methodology_reference,country,state,location,input_data_json,assumptions_json,gross_impact_tco2e,baseline_deduction_tco2e,leakage_deduction_tco2e,uncertainty_deduction_tco2e,buffer_deduction_tco2e,project_emissions_tco2e,net_estimated_credits,estimated_plastic_credits,estimated_co2e_benefit,estimated_value,readiness_score,confidence_level,missing_evidence_json,disclaimer_text,created_at,updated_at",
          )
          .eq("id", params.estimateId)
          .eq("user_id", profile.id)
          .maybeSingle<ProjectEstimate>()
      : null;
  const estimateData = estimate && "data" in estimate ? estimate.data : null;
  const assumptions = estimateData?.assumptions_json ?? {};
  const inputData = estimateData?.input_data_json ?? {};
  const annualNetCredits =
    typeof assumptions.annualNetCredits === "number"
      ? assumptions.annualNetCredits
      : null;
  const creditPrice =
    typeof inputData.creditPriceAssumption === "number"
      ? inputData.creditPriceAssumption
      : estimateData?.estimated_value && estimateData.net_estimated_credits > 0
        ? estimateData.estimated_value / estimateData.net_estimated_credits
        : undefined;
  const locationParts = [estimateData?.state, estimateData?.country]
    .filter(Boolean)
    .join(", ");
  const initialValues = estimateData
    ? {
        project_name: `${estimateData.project_type} estimate`,
        location: estimateData.location || locationParts || "Project location",
        methodology: estimateData.methodology_reference || estimateData.project_type,
        available_credits: Math.max(
          1,
          Math.round(
            estimateData.project_type === "Plastic Waste Recycling"
              ? estimateData.estimated_plastic_credits
              : estimateData.net_estimated_credits,
          ),
        ),
        price_per_credit: Math.max(0.01, creditPrice ?? 1),
        estimated_annual_credits:
          annualNetCredits === null ? null : Math.round(annualNetCredits),
        registry_name: estimateData.registry_pathway,
        documentation_score: estimateData.readiness_score,
        project_description: `${estimateData.disclaimer_text}\n\nGenerated from saved pre-feasibility estimate ${estimateData.id}. Confidence: ${estimateData.confidence_level}. Missing evidence: ${estimateData.missing_evidence_json.join(", ") || "None marked missing"}.`,
      }
    : undefined;

  return (
    <DashboardShell profile={profile} activeRole="seller">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          New project
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Create draft project
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
              Capture overview, carbon details, pricing, registry context, and
              documentation details before submitting for admin review.
            </p>
          </div>
          <Link
            href="/dashboard/seller/projects"
            className="inline-flex rounded-full border border-[#c8d2c2] px-5 py-3 text-sm font-semibold text-[#314239]"
          >
            Back to projects
          </Link>
        </div>
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
        <form action={createProject}>
          <SellerProjectFields
            redirectTo="/dashboard/seller/projects"
            initialValues={initialValues}
          />
          <PendingButton
            idleLabel="Create draft project"
            pendingLabel="Creating draft..."
            className="mt-5 rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
          />
        </form>
      </section>
    </DashboardShell>
  );
}
