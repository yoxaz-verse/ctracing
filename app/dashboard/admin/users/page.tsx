import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { PendingButton } from "@/app/_components/PendingButton";
import { adminReviewCompanyProfile } from "@/app/dashboard/actions";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "admin") {
    redirectForRole(profile.role);
  }

  const { data } = await supabase
    .from("profiles")
    .select(
      "id,email,role,company_name,contact_name,website,country,company_location,incorporated_on,gstin,gst_details,registration_type,registration_number,annual_credit_demand,preferred_project_types,carbon_purchase_goal,annual_credit_supply,project_methodologies,registry_experience,company_verification_status,company_verified_at,company_verified_by,company_verification_note,email_verified_at,onboarding_completed_at",
    )
    .order("email", { ascending: true })
    .returns<Profile[]>();

  const q = params.q?.trim().toLowerCase() ?? "";
  const role = params.role?.trim() ?? "";
  const users = (data ?? []).filter((user) => {
    const matchesRole = !role || user.role === role;
    const matchesQuery =
      !q ||
      user.email.toLowerCase().includes(q) ||
      (user.company_name ?? "").toLowerCase().includes(q) ||
      (user.country ?? "").toLowerCase().includes(q);
    return matchesRole && matchesQuery;
  });

  return (
    <DashboardShell profile={profile} activeRole="admin">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          User operations
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Review platform accounts and onboarding state.
        </h1>
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <form className="mt-8 grid gap-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#dfe5dc] md:grid-cols-[1fr_0.35fr_auto]">
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search email, company, country"
          className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
        />
        <select
          name="role"
          defaultValue={role}
          className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
        >
          <option value="">All roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
        <button className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
        {users.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="border-b border-[#e2e8df] text-[#5b6a61]">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Company</th>
                  <th className="py-3 pr-4 font-semibold">Contact</th>
                  <th className="py-3 pr-4 font-semibold">Email status</th>
                  <th className="py-3 pr-4 font-semibold">Role</th>
                  <th className="py-3 pr-4 font-semibold">Country</th>
                  <th className="py-3 pr-4 font-semibold">Email</th>
                  <th className="py-3 pr-4 font-semibold">Company review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ece3]">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 pr-4">
                      {user.company_name || "Not provided"}
                    </td>
                    <td className="py-3 pr-4">
                      {user.contact_name || "Not provided"}
                    </td>
                    <td className="py-3 pr-4">{user.email}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={user.role} />
                    </td>
                    <td className="py-3 pr-4">{user.country || "Unknown"}</td>
                    <td className="py-3 pr-4">
                      {user.email_verified_at ? "Verified" : "Email pending"}
                    </td>
                    <td className="py-3 pr-4">
                      {user.role === "admin" ? (
                        "Not applicable"
                      ) : (
                        <StatusBadge
                          status={user.company_verification_status ?? "pending"}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No users match this view."
            detail="Adjust filters to inspect buyer, seller, and admin profiles."
          />
        )}
      </section>

      <section className="mt-8 grid gap-5">
        {users
          .filter((user) => user.role === "buyer" || user.role === "seller")
          .map((user) => (
            <article
              key={user.id}
              className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]"
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_0.42fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={user.role} />
                    <StatusBadge
                      status={user.company_verification_status ?? "pending"}
                    />
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold">
                    {user.company_name || user.email}
                  </h2>
                  <p className="mt-2 text-sm text-[#6a756d]">
                    {user.company_location || "Location not provided"} ·{" "}
                    {user.country || "Country not provided"}
                  </p>

                  <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
                    <div className="rounded-2xl bg-[#f3f6f0] p-4">
                      <dt className="font-semibold text-[#314239]">GSTIN</dt>
                      <dd className="mt-1 text-[#5b6a61]">
                        {user.gstin || "Not provided"}
                      </dd>
                    </div>
                    <div className="rounded-2xl bg-[#f3f6f0] p-4">
                      <dt className="font-semibold text-[#314239]">
                        Registration
                      </dt>
                      <dd className="mt-1 text-[#5b6a61]">
                        {user.registration_type
                          ? `${user.registration_type.toUpperCase()} ${
                              user.registration_number || ""
                            }`
                          : user.registration_number || "Not provided"}
                      </dd>
                    </div>
                    <div className="rounded-2xl bg-[#f3f6f0] p-4">
                      <dt className="font-semibold text-[#314239]">
                        Incorporated
                      </dt>
                      <dd className="mt-1 text-[#5b6a61]">
                        {user.incorporated_on || "Not provided"}
                      </dd>
                    </div>
                    <div className="rounded-2xl bg-[#f3f6f0] p-4">
                      <dt className="font-semibold text-[#314239]">
                        Carbon profile
                      </dt>
                      <dd className="mt-1 text-[#5b6a61]">
                        {user.role === "buyer"
                          ? `${user.annual_credit_demand ?? 0} credits demand · ${
                              user.preferred_project_types || "types not provided"
                            }`
                          : `${user.annual_credit_supply ?? 0} credits supply · ${
                              user.project_methodologies ||
                              "methodologies not provided"
                            }`}
                      </dd>
                    </div>
                  </dl>

                  {user.company_verification_note ? (
                    <p className="mt-4 rounded-2xl bg-[#fff7df] p-4 text-sm leading-6 text-[#6c520f]">
                      <span className="font-semibold">Last admin note: </span>
                      {user.company_verification_note}
                    </p>
                  ) : null}
                </div>

                <form
                  action={adminReviewCompanyProfile}
                  className="rounded-3xl bg-[#f3f6f0] p-5"
                >
                  <input type="hidden" name="userId" value={user.id} />
                  <input
                    type="hidden"
                    name="redirectTo"
                    value="/dashboard/admin/users"
                  />
                  <label className="text-sm font-medium text-[#314239]">
                    Company decision
                  </label>
                  <select
                    name="companyVerificationStatus"
                    defaultValue={user.company_verification_status ?? "pending"}
                    className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="needs_update">Needs update</option>
                  </select>
                  <label className="mt-4 block text-sm font-medium text-[#314239]">
                    Admin note
                  </label>
                  <textarea
                    name="companyVerificationNote"
                    rows={4}
                    defaultValue={user.company_verification_note ?? ""}
                    className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                    placeholder="Optional note for the company."
                  />
                  <PendingButton
                    idleLabel="Save review"
                    pendingLabel="Saving review..."
                    className="mt-4 w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
                  />
                </form>
              </div>
            </article>
          ))}
      </section>
    </DashboardShell>
  );
}
