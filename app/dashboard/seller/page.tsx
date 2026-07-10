import { PendingButton } from "@/app/_components/PendingButton";
import {
  createProject,
  deleteProject,
  updateProject,
} from "@/app/dashboard/actions";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { MetricCard } from "@/app/dashboard/_components/MetricCard";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { BuyerInterest, CarbonProject } from "@/lib/types";

export const dynamic = "force-dynamic";

type SellerInterestRow = BuyerInterest & {
  carbon_projects?: Pick<CarbonProject, "project_name" | "location"> | null;
};

const verificationStatuses = [
  "Documentation review",
  "Registry pending",
  "Verified supply",
  "Buyer due diligence",
];

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

function StatusSelect({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? verificationStatuses[0]}
      className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
    >
      {verificationStatuses.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
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
        "id,seller_id,project_name,location,methodology,available_credits,price_per_credit,verification_status,created_at,updated_at",
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

  return (
    <DashboardShell profile={profile} activeRole="seller">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.38fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
            Seller workspace
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Manage project inventory and buyer demand signals.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
            Present estimated available credits, communicate verification
            readiness, and monitor purchase interest without implying final
            issuance.
          </p>
          {params.error ? (
            <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
              {params.error}
            </p>
          ) : null}
        </div>
        <div className="rounded-3xl bg-[#17201b] p-6 text-white">
          <p className="text-sm text-white/60">Role</p>
          <p className="mt-2 text-2xl font-semibold">Carbon credit seller</p>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Project rows are scoped to your authenticated seller profile.
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Listed credits"
          value={`${formatCredits(totalCredits)} tCO2e`}
          detail="Estimated inventory across your live project listings."
        />
        <MetricCard
          label="Projects"
          value={String(projects.length)}
          detail="Seller-owned listings stored in Supabase."
        />
        <MetricCard
          label="Buyer inquiries"
          value={String(interests.length)}
          detail="Purchase-interest records connected to your listings."
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.78fr_0.42fr]">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
            <h2 className="text-2xl font-semibold">Create project listing</h2>
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
                  Verification status
                </span>
                <StatusSelect name="verificationStatus" />
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
                  idleLabel="List project"
                  pendingLabel="Listing project..."
                  className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183b28]"
                />
              </div>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
            <div className="border-b border-[#e2e8df] pb-5">
              <h2 className="text-2xl font-semibold">Project listings</h2>
              <p className="mt-1 text-sm text-[#6a756d]">
                Edit or remove your seller-owned listings.
              </p>
            </div>

            {projects.length ? (
              <div className="mt-5 grid gap-4">
                {projects.map((project) => (
                  <article
                    key={project.id}
                    className="rounded-2xl border border-[#e0e7dc] p-5"
                  >
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
                      <label className="md:col-span-2">
                        <span className="text-sm font-medium text-[#314239]">
                          Verification status
                        </span>
                        <StatusSelect
                          name="verificationStatus"
                          defaultValue={project.verification_status}
                        />
                      </label>
                      <div className="flex flex-wrap gap-3 md:col-span-2">
                        <PendingButton
                          idleLabel="Update listing"
                          pendingLabel="Updating listing..."
                          className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183b28]"
                        />
                      </div>
                    </form>
                    <form action={deleteProject} className="mt-3">
                      <input type="hidden" name="projectId" value={project.id} />
                      <PendingButton
                        idleLabel="Delete listing"
                        pendingLabel="Deleting listing..."
                        className="rounded-full border border-[#d8b8ad] px-5 py-3 text-sm font-semibold text-[#8a2c16] transition hover:bg-[#fff1ed]"
                      />
                    </form>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-[#cbd5c5] p-6 text-sm leading-6 text-[#5b6a61]">
                No live projects yet. Create your first listing above so buyers
                can review available supply.
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
              <p className="mt-4 text-sm leading-6 text-[#5b6a61]">
                Buyer purchase-interest records will appear here after buyers
                submit interest in your listings.
              </p>
            )}
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
            <h2 className="text-xl font-semibold">Listing guidance</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5b6a61]">
              <li>Keep available credits tied to documented estimates.</li>
              <li>Update verification status as project evidence changes.</li>
              <li>Review buyer interest before any transaction workflow.</li>
            </ul>
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}
