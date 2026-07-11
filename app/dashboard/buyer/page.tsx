import Link from "next/link";
import { PendingButton } from "@/app/_components/PendingButton";
import {
  registerInterest,
  saveProject,
  unsaveProject,
} from "@/app/dashboard/actions";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { MetricCard } from "@/app/dashboard/_components/MetricCard";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { BuyerInterest, CarbonProject, SavedProject } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatCredits(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function includes(value: string | null | undefined, query: string) {
  return (value ?? "").toLowerCase().includes(query.toLowerCase());
}

export default async function BuyerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    q?: string;
    methodology?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "buyer") {
    redirectForRole(profile.role);
  }

  const [{ data: projectsData }, { data: savedData }, { data: interestsData }] =
    await Promise.all([
      supabase
        .from("carbon_projects")
        .select(
          "id,seller_id,project_name,location,methodology,available_credits,price_per_credit,verification_status,lifecycle_status,project_description,estimated_annual_credits,vintage_year,registry_name,documentation_score,created_at,updated_at",
        )
        .eq("lifecycle_status", "listed")
        .order("created_at", { ascending: false })
        .returns<CarbonProject[]>(),
      supabase
        .from("saved_projects")
        .select("id,buyer_id,project_id,created_at")
        .eq("buyer_id", profile.id)
        .returns<SavedProject[]>(),
      supabase
        .from("buyer_interests")
        .select(
          "id,buyer_id,project_id,requested_credits,status,buyer_note,seller_response_note,updated_by,created_at,updated_at",
        )
        .eq("buyer_id", profile.id)
        .returns<BuyerInterest[]>(),
    ]);

  const allProjects = projectsData ?? [];
  const savedIds = new Set((savedData ?? []).map((saved) => saved.project_id));
  const interests = interestsData ?? [];
  const interestByProject = new Map(
    interests.map((interest) => [interest.project_id, interest]),
  );
  const q = params.q?.trim() ?? "";
  const methodology = params.methodology?.trim() ?? "";
  const status = params.status?.trim() ?? "";
  const projects = allProjects.filter((project) => {
    const matchesQuery =
      !q ||
      includes(project.project_name, q) ||
      includes(project.location, q) ||
      includes(project.methodology, q) ||
      includes(project.registry_name, q);
    const matchesMethodology = !methodology || project.methodology === methodology;
    const matchesStatus =
      !status ||
      project.verification_status === status ||
      project.lifecycle_status === status;

    return matchesQuery && matchesMethodology && matchesStatus;
  });
  const methodologies = Array.from(
    new Set(allProjects.map((project) => project.methodology)),
  ).sort();
  const statuses = Array.from(
    new Set(allProjects.map((project) => project.verification_status)),
  ).sort();
  const totalCredits = allProjects.reduce(
    (sum, project) => sum + project.available_credits,
    0,
  );
  const averagePrice = allProjects.length
    ? Math.round(
        allProjects.reduce((sum, project) => sum + project.price_per_credit, 0) /
          allProjects.length,
      )
    : 0;

  return (
    <DashboardShell profile={profile} activeRole="buyer">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Buyer workspace
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight md:text-4xl">
              Discover live project supply and register purchase interest.
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
              Search listed projects, compare estimated credits and indicative
              pricing, then record demand for seller follow-up.
            </p>
          </div>
          <Link
            href="/dashboard/buyer/interests"
            className="inline-flex rounded-full border border-[#c8d2c2] px-5 py-3 text-sm font-semibold text-[#314239]"
          >
            View interest pipeline
          </Link>
        </div>
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Visible supply"
          value={`${formatCredits(totalCredits)} tCO2e`}
          detail="Estimated credits across listed marketplace projects."
        />
        <MetricCard
          label="Average indicative price"
          value={allProjects.length ? formatPrice(averagePrice) : "$0"}
          detail="Average listed price per credit for planning only."
        />
        <MetricCard
          label="Saved / active interests"
          value={`${savedIds.size} / ${interests.length}`}
          detail="Saved projects and submitted purchase-interest records."
        />
      </section>

      <form className="mt-8 grid gap-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#dfe5dc] md:grid-cols-[1fr_0.7fr_0.7fr_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search project, region, registry"
          className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
        />
        <select
          name="methodology"
          defaultValue={methodology}
          className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
        >
          <option value="">All methodologies</option>
          {methodologies.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status}
          className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
        >
          <option value="">All statuses</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <section className="mt-8 grid gap-5">
        {projects.length ? (
          projects.map((project) => {
            const existingInterest = interestByProject.get(project.id);
            const isSaved = savedIds.has(project.id);

            return (
              <article
                key={project.id}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]"
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_0.35fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={project.verification_status} />
                      {project.registry_name ? (
                        <span className="rounded-full bg-[#f3f6f0] px-3 py-1 text-xs font-semibold text-[#314239]">
                          {project.registry_name}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold">
                      {project.project_name}
                    </h2>
                    <p className="mt-2 text-sm text-[#6a756d]">
                      {project.location} · {project.methodology}
                    </p>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-[#5b6a61]">
                      {project.project_description ||
                        "Seller has not added a public project description yet."}
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-4">
                      <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                        Available{" "}
                        <span className="block font-semibold text-[#17201b]">
                          {formatCredits(project.available_credits)}
                        </span>
                      </p>
                      <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                        Annual est.{" "}
                        <span className="block font-semibold text-[#17201b]">
                          {formatCredits(project.estimated_annual_credits ?? 0)}
                        </span>
                      </p>
                      <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                        Price{" "}
                        <span className="block font-semibold text-[#17201b]">
                          {formatPrice(project.price_per_credit)}
                        </span>
                      </p>
                      <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                        Docs score{" "}
                        <span className="block font-semibold text-[#17201b]">
                          {project.documentation_score ?? 0}/100
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <form action={isSaved ? unsaveProject : saveProject}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <input
                        type="hidden"
                        name="redirectTo"
                        value="/dashboard/buyer"
                      />
                      <PendingButton
                        idleLabel={isSaved ? "Remove saved" : "Save project"}
                        pendingLabel={isSaved ? "Removing..." : "Saving..."}
                        className="w-full rounded-full border border-[#c8d2c2] px-5 py-3 text-sm font-semibold text-[#314239]"
                      />
                    </form>
                    <form
                      action={registerInterest}
                      className="rounded-2xl bg-[#f8faf6] p-4"
                    >
                      <input type="hidden" name="projectId" value={project.id} />
                      <input
                        type="hidden"
                        name="redirectTo"
                        value="/dashboard/buyer"
                      />
                      <label className="block">
                        <span className="text-sm font-medium text-[#314239]">
                          Requested credits
                        </span>
                        <input
                          required
                          min="1"
                          max={project.available_credits}
                          name="requestedCredits"
                          type="number"
                          defaultValue={
                            existingInterest?.requested_credits ??
                            Math.min(project.available_credits, 1000)
                          }
                          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                        />
                      </label>
                      <label className="mt-3 block">
                        <span className="text-sm font-medium text-[#314239]">
                          Buyer note
                        </span>
                        <textarea
                          name="buyerNote"
                          rows={3}
                          defaultValue={existingInterest?.buyer_note ?? ""}
                          placeholder="Add timing, volume, or due diligence context."
                          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                        />
                      </label>
                      <PendingButton
                        idleLabel={
                          existingInterest ? "Update interest" : "Register interest"
                        }
                        pendingLabel="Saving interest..."
                        className="mt-4 w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183b28]"
                      />
                    </form>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <EmptyState
            title="No live projects match this view"
            detail={
              allProjects.length
                ? "Adjust the filters to see more listed project supply."
                : "No seller projects are listed yet. Buyers will see projects here after sellers submit drafts and admins approve them as listed."
            }
          />
        )}
      </section>
    </DashboardShell>
  );
}
