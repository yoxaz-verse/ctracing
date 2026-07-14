import { assignFacilitatorParticipant } from "@/app/dashboard/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { MetricCard } from "@/app/dashboard/_components/MetricCard";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { CarbonProject, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatCredits(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN").format(value ?? 0);
}

function formatPrice(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function includes(value: string | null | undefined, query: string) {
  return (value ?? "").toLowerCase().includes(query.toLowerCase());
}

export default async function FacilitatorProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "facilitator") {
    redirectForRole(profile.role);
  }

  const [{ data: projectsData }, { data: sellersData }] = await Promise.all([
    supabase
      .from("carbon_projects")
      .select("id,seller_id,project_name,location,methodology,available_credits,price_per_credit,verification_status,lifecycle_status,project_description,estimated_annual_credits,vintage_year,registry_name,documentation_score,created_at,updated_at")
      .in("lifecycle_status", ["listed", "submitted", "needs_review"])
      .order("created_at", { ascending: false })
      .returns<CarbonProject[]>(),
    supabase
      .from("profiles")
      .select("id,email,role,company_name,contact_name,country,company_location,company_verification_status,email_verified_at")
      .eq("role", "seller")
      .returns<Profile[]>(),
  ]);

  const q = params.q?.trim() ?? "";
  const status = params.status?.trim() ?? "";
  const allProjects = projectsData ?? [];
  const projects = allProjects.filter((project) => {
    const matchesQuery =
      !q ||
      includes(project.project_name, q) ||
      includes(project.location, q) ||
      includes(project.methodology, q) ||
      includes(project.registry_name, q);
    const matchesStatus =
      !status ||
      project.lifecycle_status === status ||
      project.verification_status === status;
    return matchesQuery && matchesStatus;
  });
  const sellersById = new Map((sellersData ?? []).map((seller) => [seller.id, seller]));
  const totalCredits = allProjects.reduce(
    (sum, project) => sum + project.available_credits,
    0,
  );
  const listedCredits = allProjects
    .filter((project) => project.lifecycle_status === "listed")
    .reduce((sum, project) => sum + project.available_credits, 0);

  return (
    <DashboardShell profile={profile} activeRole="facilitator">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Facilitator supply board
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Browse credible supply for buyer-seller matching.
        </h1>
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard label="Visible projects" value={String(allProjects.length)} detail="Listed, submitted, and review-ready supply." />
        <MetricCard label="Listed credits" value={formatCredits(listedCredits)} detail="Credits currently visible to buyers." />
        <MetricCard label="Total review supply" value={formatCredits(totalCredits)} detail="Supply facilitators can screen for match fit." />
      </section>

      <form className="mt-8 grid gap-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#dfe5dc] md:grid-cols-[1fr_0.45fr_auto]">
        <input name="q" defaultValue={q} placeholder="Search project, region, registry" className="rounded-2xl border border-[#cbd5c5] px-4 py-3" />
        <select name="status" defaultValue={status} className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3">
          <option value="">All statuses</option>
          <option value="listed">Listed</option>
          <option value="submitted">Submitted</option>
          <option value="needs_review">Needs review</option>
        </select>
        <button className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white">Filter</button>
      </form>

      <section className="mt-8 grid gap-5">
        {projects.length ? (
          projects.map((project) => {
            const seller = sellersById.get(project.seller_id);

            return (
              <article key={project.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
                <div className="grid gap-5 lg:grid-cols-[1fr_0.28fr]">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={project.lifecycle_status} />
                      <StatusBadge status={project.verification_status} />
                      {seller?.company_verification_status ? (
                        <StatusBadge status={seller.company_verification_status} />
                      ) : null}
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold">{project.project_name}</h2>
                    <p className="mt-2 text-sm text-[#6a756d]">
                      {project.location} - {project.methodology}
                    </p>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-[#5b6a61]">
                      {project.project_description || "No public project description yet."}
                    </p>
                    <p className="mt-4 text-sm text-[#314239]">
                      Seller: {seller?.company_name || seller?.email || project.seller_id}
                    </p>
                  </div>
                  <form action={assignFacilitatorParticipant} className="rounded-2xl bg-[#f3f6f0] p-5">
                    <input type="hidden" name="assignmentScope" value="project" />
                    <input type="hidden" name="targetId" value={project.id} />
                    <input type="hidden" name="redirectTo" value="/dashboard/facilitator/projects" />
                    <p className="text-sm text-[#5b6a61]">Available</p>
                    <p className="mt-1 text-2xl font-semibold text-[#214d35]">{formatCredits(project.available_credits)}</p>
                    <p className="mt-3 text-sm text-[#5b6a61]">{formatPrice(project.price_per_credit)}/credit</p>
                    <p className="mt-3 text-sm text-[#5b6a61]">Docs score {project.documentation_score ?? 0}/100</p>
                    <PendingButton idleLabel="Handle project" pendingLabel="Assigning..." className="mt-5 w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white" />
                  </form>
                </div>
              </article>
            );
          })
        ) : (
          <EmptyState title="No projects match this view." detail="Adjust filters to find supply for match screening." />
        )}
      </section>
    </DashboardShell>
  );
}
