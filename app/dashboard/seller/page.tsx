import { PendingButton } from "@/app/_components/PendingButton";
import {
  createProject,
  deleteProject,
  submitProjectForReview,
  updateProject,
} from "@/app/dashboard/actions";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { MetricCard } from "@/app/dashboard/_components/MetricCard";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { BuyerInterest, CarbonProject } from "@/lib/types";

export const dynamic = "force-dynamic";

type SellerInterestRow = BuyerInterest & {
  carbon_projects?: Pick<CarbonProject, "project_name" | "location"> | null;
};

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

export default async function SellerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const [{ data: projectRows }, { data: interestRows }] = await Promise.all([
    supabase
      .from("carbon_projects")
      .select(
        "id,seller_id,project_name,location,methodology,available_credits,price_per_credit,verification_status,lifecycle_status,created_at,updated_at",
      )
      .eq("seller_id", profile.id)
      .order("created_at", { ascending: false })
      .returns<CarbonProject[]>(),
    supabase
      .from("buyer_interests")
      .select(
        "id,buyer_id,project_id,requested_credits,status,created_at,updated_at,carbon_projects(project_name,location)",
      )
      .order("created_at", { ascending: false })
      .returns<SellerInterestRow[]>(),
  ]);

  const projects = projectRows ?? [];
  const interests = interestRows ?? [];
  const totalCredits = projects.reduce(
    (sum, project) => sum + project.available_credits,
    0,
  );
  const listedCredits = projects
    .filter((project) => project.lifecycle_status === "listed")
    .reduce((sum, project) => sum + project.available_credits, 0);

  return (
    <DashboardShell profile={profile} activeRole="seller">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Seller workspace
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight md:text-4xl">
              Manage project inventory and buyer demand signals.
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
              Present estimated available credits, communicate verification
              readiness, and monitor purchase interest without implying final
              issuance.
            </p>
          </div>
          <a
            href="#create-project"
            className="inline-flex rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
          >
            Create draft project
          </a>
        </div>
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Listed credits"
          value={`${formatCredits(listedCredits)} tCO2e`}
          detail="Estimated inventory visible to buyers after admin approval."
        />
        <MetricCard
          label="Projects"
          value={String(projects.length)}
          detail={`${formatCredits(totalCredits)} tCO2e across all draft, review, and listed projects.`}
        />
        <MetricCard
          label="Buyer inquiries"
          value={String(interests.length)}
          detail="Purchase-interest records connected to your listings."
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.78fr_0.42fr]">
        <div className="space-y-6">
          <div
            id="create-project"
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]"
          >
            <h2 className="text-2xl font-semibold">Create draft project</h2>
            <p className="mt-2 text-sm leading-6 text-[#5b6a61]">
              Draft projects stay private until you submit them for admin review
              and an admin marks them as listed.
            </p>
            <form action={createProject} className="mt-5 grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-sm font-medium text-[#314239]">
                  Project name
                </span>
                <input
                  required
                  name="projectName"
                  className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                  placeholder="Western Ghats Afforestation Corridor"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-[#314239]">
                  Location
                </span>
                <input
                  required
                  name="location"
                  className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                  placeholder="Karnataka, India"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-[#314239]">
                  Methodology
                </span>
                <input
                  required
                  name="methodology"
                  className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                  placeholder="ARR - Afforestation"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-[#314239]">
                  Estimated credits
                </span>
                <input
                  required
                  min="1"
                  type="number"
                  name="availableCredits"
                  className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                  placeholder="24000"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-[#314239]">
                  Indicative price per credit
                </span>
                <input
                  required
                  min="0.01"
                  step="0.01"
                  type="number"
                  name="pricePerCredit"
                  className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                  placeholder="18"
                />
              </label>
              <div className="md:col-span-2">
                <PendingButton
                  idleLabel="Create draft project"
                  pendingLabel="Creating draft..."
                  className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183b28]"
                />
              </div>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
            <div className="border-b border-[#e2e8df] pb-5">
              <h2 className="text-2xl font-semibold">Project listings</h2>
              <p className="mt-1 text-sm text-[#6a756d]">
                Edit drafts, submit projects for admin review, and track buyer visibility.
              </p>
            </div>

            {projects.length ? (
              <div className="mt-5 grid gap-4">
                {projects.map((project) => (
                  <article
                    key={project.id}
                    className="rounded-2xl border border-[#e0e7dc] p-5"
                  >
                    <div className="mb-4 flex flex-wrap gap-2">
                      <StatusBadge status={project.lifecycle_status} />
                      <StatusBadge status={project.verification_status} />
                    </div>
                    <form
                      action={updateProject}
                      className="grid gap-4 md:grid-cols-2"
                    >
                      <input type="hidden" name="projectId" value={project.id} />
                      <label className="md:col-span-2">
                        <span className="text-sm font-medium text-[#314239]">
                          Project name
                        </span>
                        <input
                          required
                          name="projectName"
                          defaultValue={project.project_name}
                          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                        />
                      </label>
                      <label>
                        <span className="text-sm font-medium text-[#314239]">
                          Location
                        </span>
                        <input
                          required
                          name="location"
                          defaultValue={project.location}
                          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                        />
                      </label>
                      <label>
                        <span className="text-sm font-medium text-[#314239]">
                          Methodology
                        </span>
                        <input
                          required
                          name="methodology"
                          defaultValue={project.methodology}
                          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                        />
                      </label>
                      <label>
                        <span className="text-sm font-medium text-[#314239]">
                          Estimated credits
                        </span>
                        <input
                          required
                          min="1"
                          type="number"
                          name="availableCredits"
                          defaultValue={project.available_credits}
                          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                        />
                      </label>
                      <label>
                        <span className="text-sm font-medium text-[#314239]">
                          Indicative price
                        </span>
                        <input
                          required
                          min="0.01"
                          step="0.01"
                          type="number"
                          name="pricePerCredit"
                          defaultValue={project.price_per_credit}
                          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                        />
                      </label>
                      <div className="flex flex-wrap gap-3 md:col-span-2">
                        <PendingButton
                          idleLabel="Update project"
                          pendingLabel="Updating project..."
                          className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183b28]"
                        />
                      </div>
                    </form>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {project.lifecycle_status === "listed" ? null : (
                        <form action={submitProjectForReview}>
                          <input type="hidden" name="projectId" value={project.id} />
                          <input
                            type="hidden"
                            name="redirectTo"
                            value="/dashboard/seller"
                          />
                          <PendingButton
                            idleLabel="Submit for admin review"
                            pendingLabel="Submitting..."
                            className="rounded-full border border-[#c8d2c2] px-5 py-3 text-sm font-semibold text-[#314239] transition hover:bg-[#f3f6f0]"
                          />
                        </form>
                      )}
                      <form action={deleteProject}>
                        <input type="hidden" name="projectId" value={project.id} />
                        <PendingButton
                          idleLabel="Delete project"
                          pendingLabel="Deleting project..."
                          className="rounded-full border border-[#d8b8ad] px-5 py-3 text-sm font-semibold text-[#8a2c16] transition hover:bg-[#fff1ed]"
                        />
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="No project listings yet"
                  detail="Create your first draft above, then submit it for admin review before buyers can discover the supply."
                />
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-[#e3eadf] p-6 ring-1 ring-[#ccd8c6]">
            <h2 className="text-xl font-semibold">Buyer inquiries</h2>
            {interests.length ? (
              <div className="mt-5 space-y-3">
                {interests.map((interest) => (
                  <div
                    key={interest.id}
                    className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#dfe5dc]"
                  >
                    <p className="text-sm font-semibold">
                      Request for {formatCredits(interest.requested_credits)}{" "}
                      credits
                    </p>
                    <p className="mt-2 text-sm text-[#314239]">
                      {interest.carbon_projects?.project_name ??
                        "Project listing"}
                    </p>
                    <p className="mt-2 text-sm text-[#6a756d]">
                      {interest.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  title="No buyer inquiries yet"
                  detail="Purchase-interest records will appear here after buyers submit interest in your listed projects."
                />
              </div>
            )}
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
            <h2 className="text-xl font-semibold">Listing guidance</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5b6a61]">
              <li>Keep available credits tied to documented estimates.</li>
              <li>Submit drafts for admin review when the listing is ready.</li>
              <li>Admin review controls documentation and listing status.</li>
              <li>Review buyer interest after a project is approved as listed.</li>
            </ul>
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}
