import Link from "next/link";
import { PendingButton } from "@/app/_components/PendingButton";
import {
  deleteProject,
  submitProjectForReview,
} from "@/app/dashboard/actions";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { CarbonProject } from "@/lib/types";

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

export default async function SellerProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const { data: projectsData } = await supabase
    .from("carbon_projects")
    .select(
      "id,seller_id,project_name,location,methodology,available_credits,price_per_credit,verification_status,lifecycle_status,project_description,estimated_annual_credits,vintage_year,registry_name,documentation_score,created_at,updated_at",
    )
    .eq("seller_id", profile.id)
    .order("created_at", { ascending: false })
    .returns<CarbonProject[]>();

  const projects = projectsData ?? [];

  return (
    <DashboardShell profile={profile} activeRole="seller">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Seller projects
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Project inventory
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
              Manage project listings from one scannable inventory view. Open a
              project to edit details, add documents, or submit drafts for admin review.
            </p>
          </div>
          <Link
            href="/dashboard/seller/projects/new"
            className="inline-flex rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
          >
            Create draft project
          </Link>
        </div>
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-4">
        {projects.length ? (
          projects.map((project) => (
            <article
              key={project.id}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#dfe5dc]"
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={project.lifecycle_status} />
                    <StatusBadge status={project.verification_status} />
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold">
                    {project.project_name}
                  </h2>
                  <p className="mt-2 text-sm text-[#6a756d]">
                    {project.location} · {project.methodology}
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                      Available{" "}
                      <span className="block font-semibold text-[#17201b]">
                        {formatCredits(project.available_credits)}
                      </span>
                    </p>
                    <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                      Price{" "}
                      <span className="block font-semibold text-[#17201b]">
                        {formatPrice(project.price_per_credit)}
                      </span>
                    </p>
                    <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                      Registry{" "}
                      <span className="block truncate font-semibold text-[#17201b]">
                        {project.registry_name || "Not set"}
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

                <div className="flex flex-wrap gap-3 lg:w-52 lg:flex-col">
                  <Link
                    href={`/dashboard/seller/projects/${project.id}`}
                    className="inline-flex justify-center rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Edit
                  </Link>
                  {project.lifecycle_status === "listed" ? null : (
                    <form action={submitProjectForReview}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <input
                        type="hidden"
                        name="redirectTo"
                        value="/dashboard/seller/projects"
                      />
                      <PendingButton
                        idleLabel="Submit for admin review"
                        pendingLabel="Submitting..."
                        className="w-full rounded-full border border-[#c8d2c2] px-5 py-3 text-sm font-semibold text-[#314239]"
                      />
                    </form>
                  )}
                  <form action={deleteProject}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <input
                      type="hidden"
                      name="redirectTo"
                      value="/dashboard/seller/projects"
                    />
                    <PendingButton
                      idleLabel="Delete"
                      pendingLabel="Deleting..."
                      className="w-full rounded-full border border-[#d8b8ad] px-5 py-3 text-sm font-semibold text-[#8a2c16]"
                    />
                  </form>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
            <EmptyState
              title="No project listings yet."
              detail="Create your first draft project, add documentation metadata, and submit it for admin review when ready."
            />
            <Link
              href="/dashboard/seller/projects/new"
              className="mt-5 inline-flex rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
            >
              Create draft project
            </Link>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
