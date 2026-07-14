import Link from "next/link";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { MetricCard } from "@/app/dashboard/_components/MetricCard";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type {
  BuyerInterest,
  CarbonProject,
  FacilitatorManagedParticipant,
  FacilitatorOpportunity,
  Profile,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function formatCredits(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN").format(value ?? 0);
}

export default async function FacilitatorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "facilitator") {
    redirectForRole(profile.role);
  }

  const [
    { data: profileRows },
    { data: projectRows },
    { data: interestRows },
    { data: participantRows },
    { data: opportunityRows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id,email,role,company_name,contact_name,website,country,company_location,company_verification_status,email_verified_at,onboarding_completed_at,annual_credit_demand,preferred_project_types,annual_credit_supply,project_methodologies",
      )
      .in("role", ["buyer", "seller"])
      .returns<Profile[]>(),
    supabase
      .from("carbon_projects")
      .select(
        "id,seller_id,project_name,location,methodology,available_credits,price_per_credit,verification_status,lifecycle_status,documentation_score,created_at,updated_at",
      )
      .in("lifecycle_status", ["listed", "submitted", "needs_review"])
      .returns<CarbonProject[]>(),
    supabase
      .from("buyer_interests")
      .select("id,buyer_id,project_id,requested_credits,status,buyer_note,seller_response_note,updated_by,created_at,updated_at")
      .returns<BuyerInterest[]>(),
    supabase
      .from("facilitator_managed_participants")
      .select("id,facilitator_id,participant_type,linked_profile_id,company_name,contact_name,email,phone,country,notes,created_at,updated_at")
      .eq("facilitator_id", profile.id)
      .returns<FacilitatorManagedParticipant[]>(),
    supabase
      .from("facilitator_opportunities")
      .select("id,facilitator_id,buyer_profile_id,seller_profile_id,buyer_participant_id,seller_participant_id,project_id,interest_id,title,requested_credits,fit_score,stage,priority,facilitator_notes,next_action,closed_reason,created_at,updated_at")
      .eq("facilitator_id", profile.id)
      .order("updated_at", { ascending: false })
      .returns<FacilitatorOpportunity[]>(),
  ]);

  const profiles = profileRows ?? [];
  const projects = projectRows ?? [];
  const interests = interestRows ?? [];
  const participants = participantRows ?? [];
  const opportunities = opportunityRows ?? [];
  const openOpportunities = opportunities.filter(
    (item) => item.stage !== "closed_won" && item.stage !== "closed_lost",
  );
  const profilesById = new Map(profiles.map((item) => [item.id, item]));
  const projectsById = new Map(projects.map((item) => [item.id, item]));
  const totalCredits = projects.reduce(
    (sum, project) => sum + project.available_credits,
    0,
  );

  return (
    <DashboardShell profile={profile} activeRole="facilitator">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Facilitator workspace
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight md:text-4xl">
              Build qualified buyer-seller match pipelines.
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
              Browse credible supply, manage buyer and seller contacts, and
              move opportunities through a facilitator-owned workflow.
            </p>
          </div>
          <Link
            href="/dashboard/facilitator/matches"
            className="inline-flex rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
          >
            Open match pipeline
          </Link>
        </div>
        {profile.company_verification_status !== "verified" ? (
          <p className="mt-5 rounded-2xl bg-[#fff7df] px-4 py-3 text-sm text-[#795b12]">
            Admin verification is required before creating participants,
            assignments, opportunities, or messages.
          </p>
        ) : null}
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Buyer profiles" value={String(profiles.filter((item) => item.role === "buyer").length)} detail="Visible buyer companies." />
        <MetricCard label="Seller profiles" value={String(profiles.filter((item) => item.role === "seller").length)} detail="Visible seller companies." />
        <MetricCard label="Managed contacts" value={String(participants.length)} detail="Buyer or seller records handled by you." />
        <MetricCard label="Open matches" value={String(openOpportunities.length)} detail="Active facilitator opportunities." />
        <MetricCard label="Visible credits" value={formatCredits(totalCredits)} detail="Supply in listed or review-ready projects." />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_0.42fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Priority opportunities</h2>
              <p className="mt-1 text-sm text-[#6a756d]">
                Latest matches you are actively handling.
              </p>
            </div>
            <Link
              href="/dashboard/facilitator/matches"
              className="text-sm font-semibold text-[#214d35]"
            >
              View all
            </Link>
          </div>
          <div className="mt-5 grid gap-4">
            {openOpportunities.length ? (
              openOpportunities.slice(0, 5).map((opportunity) => {
                const project = opportunity.project_id
                  ? projectsById.get(opportunity.project_id)
                  : null;
                const buyer = opportunity.buyer_profile_id
                  ? profilesById.get(opportunity.buyer_profile_id)
                  : null;
                const seller = opportunity.seller_profile_id
                  ? profilesById.get(opportunity.seller_profile_id)
                  : null;

                return (
                  <article
                    key={opportunity.id}
                    className="rounded-2xl border border-[#e0e7dc] p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={opportunity.stage} />
                      <StatusBadge status={opportunity.priority} />
                    </div>
                    <h3 className="mt-3 text-lg font-semibold">
                      {opportunity.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#5b6a61]">
                      {buyer?.company_name || buyer?.email || "Buyer TBD"} to{" "}
                      {seller?.company_name || seller?.email || "Seller TBD"}
                      {project ? ` - ${project.project_name}` : ""}
                    </p>
                    <p className="mt-3 text-sm text-[#314239]">
                      Next action: {opportunity.next_action || "Not set"}
                    </p>
                  </article>
                );
              })
            ) : (
              <EmptyState
                title="No active opportunities yet."
                detail="Create a match from the pipeline once buyer demand and seller supply line up."
              />
            )}
          </div>
        </div>

        <aside className="rounded-3xl bg-[#e3eadf] p-6 ring-1 ring-[#ccd8c6]">
          <h2 className="text-2xl font-semibold">Market signals</h2>
          <div className="mt-5 space-y-3">
            <p className="rounded-2xl bg-white p-4 text-sm text-[#5b6a61]">
              Buyer demand records{" "}
              <span className="block text-lg font-semibold text-[#17201b]">
                {interests.length}
              </span>
            </p>
            <p className="rounded-2xl bg-white p-4 text-sm text-[#5b6a61]">
              Projects in review/listed states{" "}
              <span className="block text-lg font-semibold text-[#17201b]">
                {projects.length}
              </span>
            </p>
            <p className="rounded-2xl bg-white p-4 text-sm text-[#5b6a61]">
              Average fit score{" "}
              <span className="block text-lg font-semibold text-[#17201b]">
                {opportunities.length
                  ? Math.round(
                      opportunities.reduce((sum, item) => sum + item.fit_score, 0) /
                        opportunities.length,
                    )
                  : 0}
                /100
              </span>
            </p>
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}
