import { PendingButton } from "@/app/_components/PendingButton";
import { registerInterest } from "@/app/dashboard/actions";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { MetricCard } from "@/app/dashboard/_components/MetricCard";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { BuyerInterest, CarbonProject } from "@/lib/types";

export const dynamic = "force-dynamic";

type BuyerInterestRow = BuyerInterest & {
  carbon_projects?: Pick<
    CarbonProject,
    "project_name" | "location" | "verification_status"
  > | null;
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

export default async function BuyerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "buyer") {
    redirectForRole(profile.role);
  }

  const [{ data: projectRows }, { data: interestRows }] = await Promise.all([
    supabase
      .from("carbon_projects")
      .select(
        "id,seller_id,project_name,location,methodology,available_credits,price_per_credit,verification_status,created_at,updated_at",
      )
      .order("created_at", { ascending: false })
      .returns<CarbonProject[]>(),
    supabase
      .from("buyer_interests")
      .select(
        "id,buyer_id,project_id,requested_credits,status,created_at,updated_at,carbon_projects(project_name,location,verification_status)",
      )
      .eq("buyer_id", profile.id)
      .order("created_at", { ascending: false })
      .returns<BuyerInterestRow[]>(),
  ]);

  const projects = projectRows ?? [];
  const interests = interestRows ?? [];
  const interestByProject = new Map(
    interests.map((interest) => [interest.project_id, interest]),
  );
  const totalCredits = projects.reduce(
    (sum, project) => sum + project.available_credits,
    0,
  );
  const averagePrice = projects.length
    ? Math.round(
        projects.reduce((sum, project) => sum + project.price_per_credit, 0) /
          projects.length,
      )
    : 0;

  return (
    <DashboardShell profile={profile} activeRole="buyer">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.38fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
            Buyer workspace
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Discover carbon credit supply with clear verification context.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
            Review available projects, estimated volume, indicative pricing, and
            documentation status before registering purchase interest.
          </p>
          {params.error ? (
            <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
              {params.error}
            </p>
          ) : null}
        </div>
        <div className="rounded-3xl bg-[#17201b] p-6 text-white">
          <p className="text-sm text-white/60">Role</p>
          <p className="mt-2 text-2xl font-semibold">Carbon credit buyer</p>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Purchase-interest records are stored under your verified buyer
            profile.
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Visible supply"
          value={`${formatCredits(totalCredits)} tCO2e`}
          detail="Estimated credits across currently listed projects."
        />
        <MetricCard
          label="Average indicative price"
          value={projects.length ? formatPrice(averagePrice) : "$0"}
          detail="Average listed price per credit for planning only."
        />
        <MetricCard
          label="Active interests"
          value={String(interests.length)}
          detail="Your submitted purchase-interest records."
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.45fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
          <div className="border-b border-[#e2e8df] pb-5">
            <h2 className="text-2xl font-semibold">Project marketplace</h2>
            <p className="mt-1 text-sm text-[#6a756d]">
              Live seller listings from Supabase.
            </p>
          </div>

          {projects.length ? (
            <div className="mt-5 divide-y divide-[#e6ece3]">
              {projects.map((project) => {
                const existingInterest = interestByProject.get(project.id);

                return (
                  <article key={project.id} className="grid gap-5 py-5">
                    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#557462]">
                          {project.methodology}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold">
                          {project.project_name}
                        </h3>
                        <p className="mt-1 text-sm text-[#6a756d]">
                          {project.location}
                        </p>
                        <p className="mt-3 text-sm text-[#314239]">
                          Verification status: {project.verification_status}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#f3f6f0] p-4 text-left md:text-right">
                        <p className="text-xl font-semibold text-[#214d35]">
                          {formatCredits(project.available_credits)}
                        </p>
                        <p className="text-sm text-[#6a756d]">
                          estimated credits available
                        </p>
                        <p className="mt-3 text-sm font-semibold">
                          {formatPrice(project.price_per_credit)}/credit
                        </p>
                      </div>
                    </div>

                    <form
                      action={registerInterest}
                      className="grid gap-3 rounded-2xl bg-[#f8faf6] p-4 sm:grid-cols-[1fr_auto]"
                    >
                      <input
                        type="hidden"
                        name="projectId"
                        value={project.id}
                      />
                      <label>
                        <span className="text-sm font-medium text-[#314239]">
                          Purchase-interest volume
                        </span>
                        <input
                          required
                          min="1"
                          max={project.available_credits}
                          type="number"
                          name="requestedCredits"
                          defaultValue={
                            existingInterest?.requested_credits ??
                            Math.min(project.available_credits, 1000)
                          }
                          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                        />
                      </label>
                      <div className="flex items-end">
                        <PendingButton
                          idleLabel={
                            existingInterest
                              ? "Update interest"
                              : "Register interest"
                          }
                          pendingLabel="Saving interest..."
                          className="w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183b28] sm:w-auto"
                        />
                      </div>
                    </form>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-[#cbd5c5] p-6 text-sm leading-6 text-[#5b6a61]">
              No seller projects are listed yet. Once a seller creates a live
              project, it will appear here for buyer review.
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-[#e3eadf] p-6 ring-1 ring-[#ccd8c6]">
            <h2 className="text-xl font-semibold">Your interests</h2>
            {interests.length ? (
              <div className="mt-5 space-y-3">
                {interests.map((interest) => (
                  <div
                    key={interest.id}
                    className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#dfe5dc]"
                  >
                    <p className="text-sm font-semibold">
                      {formatCredits(interest.requested_credits)} credits
                    </p>
                    <p className="mt-2 text-sm text-[#314239]">
                      {interest.carbon_projects?.project_name ??
                        "Project listing"}
                    </p>
                    <p className="mt-1 text-sm text-[#6a756d]">
                      {interest.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-[#5b6a61]">
                No purchase interest has been registered yet.
              </p>
            )}
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
            <h2 className="text-xl font-semibold">Recommended next steps</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5b6a61]">
              <li>Review project documentation before recording demand.</li>
              <li>Compare verification status across similar methodologies.</li>
              <li>Keep impact language tied to estimated, documented supply.</li>
            </ul>
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}
