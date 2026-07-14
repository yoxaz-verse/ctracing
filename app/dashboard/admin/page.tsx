import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { MetricCard } from "@/app/dashboard/_components/MetricCard";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { BuyerInterest, CarbonProject, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatCredits(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatDate(value: string | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "admin") {
    redirectForRole(profile.role);
  }

  const [
    { data: profileRows },
    { data: projectRows },
    { data: interestRows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id,email,role,company_name,contact_name,website,country,company_location,company_verification_status,email_verified_at,onboarding_completed_at",
      )
      .order("email", { ascending: true })
      .returns<Profile[]>(),
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
        "id,buyer_id,project_id,requested_credits,status,created_at,updated_at",
      )
      .order("created_at", { ascending: false })
      .returns<BuyerInterest[]>(),
  ]);

  const profiles = profileRows ?? [];
  const projects = projectRows ?? [];
  const interests = interestRows ?? [];
  const profilesById = new Map(profiles.map((row) => [row.id, row]));
  const projectsById = new Map(projects.map((row) => [row.id, row]));
  const buyerCount = profiles.filter((row) => row.role === "buyer").length;
  const sellerCount = profiles.filter((row) => row.role === "seller").length;
  const facilitatorCount = profiles.filter(
    (row) => row.role === "facilitator",
  ).length;
  const totalCredits = projects.reduce(
    (sum, project) => sum + project.available_credits,
    0,
  );

  return (
    <DashboardShell profile={profile} activeRole="admin">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.38fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
            Admin workspace
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Monitor buyers, sellers, facilitators, listings, and purchase interest.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
            This read-only control view gives TeraTrace operators visibility
            across marketplace records without changing project claims or
            transaction status.
          </p>
        </div>
        <div className="rounded-3xl bg-[#17201b] p-6 text-white">
          <p className="text-sm text-white/60">Role</p>
          <p className="mt-2 text-2xl font-semibold">Platform admin</p>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Admin access is assigned manually by updating the Supabase profile
            role to admin.
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Buyers" value={String(buyerCount)} detail="Registered buyer profiles." />
        <MetricCard label="Sellers" value={String(sellerCount)} detail="Registered seller profiles." />
        <MetricCard label="Facilitators" value={String(facilitatorCount)} detail="Matchmaking workspaces." />
        <MetricCard label="Projects" value={String(projects.length)} detail="Live project listings." />
        <MetricCard label="Listed credits" value={formatCredits(totalCredits)} detail="Estimated visible supply." />
        <MetricCard label="Interests" value={String(interests.length)} detail="Buyer demand records." />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.82fr_0.48fr]">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
            <h2 className="text-2xl font-semibold">Profiles</h2>
            {profiles.length ? (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-[#e2e8df] text-[#5b6a61]">
                    <tr>
                      <th className="py-3 pr-4 font-semibold">Company</th>
                      <th className="py-3 pr-4 font-semibold">Email</th>
                      <th className="py-3 pr-4 font-semibold">Role</th>
                      <th className="py-3 pr-4 font-semibold">Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6ece3]">
                    {profiles.map((row) => (
                      <tr key={row.id}>
                        <td className="py-3 pr-4">
                          {row.company_name || "Not provided"}
                        </td>
                        <td className="py-3 pr-4">{row.email}</td>
                        <td className="py-3 pr-4 capitalize">{row.role}</td>
                        <td className="py-3 pr-4">
                          <span className="mr-2">
                            {row.email_verified_at ? "Email verified" : "Email pending"}
                          </span>
                          {row.role !== "admin" ? (
                            <span>
                              Company {row.company_verification_status ?? "pending"}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#5b6a61]">
                No profiles are visible to this admin account yet.
              </p>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
            <h2 className="text-2xl font-semibold">All project listings</h2>
            {projects.length ? (
              <div className="mt-5 grid gap-4">
                {projects.map((project) => {
                  const seller = profilesById.get(project.seller_id);

                  return (
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
                          <p className="mt-2 text-sm text-[#314239]">
                            Seller:{" "}
                            {seller?.company_name || seller?.email || project.seller_id}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#f3f6f0] px-3 py-1 text-sm font-semibold text-[#314239]">
                          {project.verification_status}
                        </span>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <p className="text-sm text-[#5b6a61]">
                          Credits:{" "}
                          <span className="font-semibold text-[#17201b]">
                            {formatCredits(project.available_credits)}
                          </span>
                        </p>
                        <p className="text-sm text-[#5b6a61]">
                          Price:{" "}
                          <span className="font-semibold text-[#17201b]">
                            ${project.price_per_credit}/credit
                          </span>
                        </p>
                        <p className="text-sm text-[#5b6a61]">
                          Created:{" "}
                          <span className="font-semibold text-[#17201b]">
                            {formatDate(project.created_at)}
                          </span>
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#5b6a61]">
                No project listings have been created yet.
              </p>
            )}
          </div>
        </div>

        <aside className="rounded-3xl bg-[#e3eadf] p-6 ring-1 ring-[#ccd8c6]">
          <h2 className="text-2xl font-semibold">Buyer interests</h2>
          {interests.length ? (
            <div className="mt-5 space-y-3">
              {interests.map((interest) => {
                const buyer = profilesById.get(interest.buyer_id);
                const project = projectsById.get(interest.project_id);

                return (
                  <div
                    key={interest.id}
                    className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#dfe5dc]"
                  >
                    <p className="text-sm font-semibold">
                      {formatCredits(interest.requested_credits)} credits
                    </p>
                    <p className="mt-2 text-sm text-[#314239]">
                      {project?.project_name ?? interest.project_id}
                    </p>
                    <p className="mt-2 text-sm text-[#6a756d]">
                      Buyer:{" "}
                      {buyer?.company_name || buyer?.email || interest.buyer_id}
                    </p>
                    <p className="mt-2 text-sm text-[#6a756d]">
                      Status: {interest.status}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[#5b6a61]">
              No buyer purchase-interest records have been submitted yet.
            </p>
          )}
        </aside>
      </section>
    </DashboardShell>
  );
}
