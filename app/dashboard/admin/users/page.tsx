import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "admin") {
    redirectForRole(profile.role);
  }

  const { data } = await supabase
    .from("profiles")
    .select(
      "id,email,role,company_name,contact_name,website,country,email_verified_at,onboarding_completed_at",
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
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-[#e2e8df] text-[#5b6a61]">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Company</th>
                  <th className="py-3 pr-4 font-semibold">Contact</th>
                  <th className="py-3 pr-4 font-semibold">Email</th>
                  <th className="py-3 pr-4 font-semibold">Role</th>
                  <th className="py-3 pr-4 font-semibold">Country</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
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
    </DashboardShell>
  );
}
