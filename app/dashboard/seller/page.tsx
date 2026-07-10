import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { MetricCard } from "@/app/dashboard/_components/MetricCard";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import { sampleInterests, sampleProjects } from "@/lib/sample-data";
import type { CarbonProject } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatCredits(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export default async function SellerDashboardPage() {
  const { supabase, profile } = await getSessionProfile();
  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const { data } = await supabase
    .from("carbon_projects")
    .select(
      "id,seller_id,project_name,location,methodology,available_credits,price_per_credit,verification_status",
    )
    .eq("seller_id", profile.id)
    .order("created_at", { ascending: false })
    .returns<CarbonProject[]>();

  const projects = data?.length ? data : sampleProjects;
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
            Present available credits, communicate verification readiness, and
            monitor purchase interest without implying final issuance.
          </p>
        </div>
        <div className="rounded-3xl bg-[#17201b] p-6 text-white">
          <p className="text-sm text-white/60">Role</p>
          <p className="mt-2 text-2xl font-semibold">Carbon credit seller</p>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Project rows are scoped to the authenticated seller profile.
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Listed credits"
          value={`${formatCredits(totalCredits)} tCO2e`}
          detail="Estimated inventory across visible project listings."
        />
        <MetricCard
          label="Projects"
          value={String(projects.length)}
          detail="Seller-owned listings when connected to Supabase."
        />
        <MetricCard
          label="Buyer inquiries"
          value={String(sampleInterests.length)}
          detail="Sample demand signals for the first dashboard version."
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.45fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
          <div className="flex flex-col gap-2 border-b border-[#e2e8df] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Project listings</h2>
              <p className="mt-1 text-sm text-[#6a756d]">
                Replace sample listings by inserting seller-owned projects.
              </p>
            </div>
            <span className="rounded-full bg-[#eef6ed] px-3 py-1 text-xs font-semibold text-[#214d35]">
              {data?.length ? "Database" : "Sample data"}
            </span>
          </div>
          <div className="mt-5 grid gap-4">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-2xl border border-[#e0e7dc] p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {project.project_name}
                    </h3>
                    <p className="mt-1 text-sm text-[#6a756d]">
                      {project.location} · {project.methodology}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#f3f6f0] px-3 py-1 text-sm font-semibold text-[#314239]">
                    {project.verification_status}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-[#6a756d]">Available credits</p>
                    <p className="mt-1 font-semibold">
                      {formatCredits(project.available_credits)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6a756d]">Indicative price</p>
                    <p className="mt-1 font-semibold">
                      ${project.price_per_credit}/credit
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6a756d]">Documentation</p>
                    <p className="mt-1 font-semibold">Project packet needed</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-[#e3eadf] p-6 ring-1 ring-[#ccd8c6]">
            <h2 className="text-xl font-semibold">Buyer inquiries</h2>
            <div className="mt-5 space-y-3">
              {sampleInterests.map((interest) => (
                <div
                  key={interest.id}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#dfe5dc]"
                >
                  <p className="text-sm font-semibold">
                    Request for {formatCredits(interest.requested_credits)}{" "}
                    credits
                  </p>
                  <p className="mt-2 text-sm text-[#6a756d]">
                    {interest.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
            <h2 className="text-xl font-semibold">Verification checklist</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5b6a61]">
              <li>Upload project documentation in the next workflow phase.</li>
              <li>Keep registry status distinct from estimated availability.</li>
              <li>Respond to buyer interest after reviewing requested volume.</li>
            </ul>
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}
