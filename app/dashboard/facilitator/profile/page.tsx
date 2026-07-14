import { CompanyProfileForm } from "@/app/dashboard/_components/CompanyProfileForm";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { getSessionProfile, redirectForRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function FacilitatorProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await getSessionProfile();

  if (profile.role !== "facilitator") {
    redirectForRole(profile.role);
  }

  return (
    <DashboardShell profile={profile} activeRole="facilitator">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Facilitator profile
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight">
          Maintain company identity and matchmaking focus.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
          Facilitator workflow actions unlock after an admin verifies this
          profile. You can still complete company details while approval is
          pending.
        </p>
        {params.saved ? (
          <p className="mt-5 rounded-2xl bg-[#eef6ed] px-4 py-3 text-sm text-[#214d35]">
            Facilitator profile saved.
          </p>
        ) : null}
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <div className="mt-8">
        <CompanyProfileForm
          profile={profile}
          role="facilitator"
          redirectTo="/dashboard/facilitator/profile"
        />
      </div>
    </DashboardShell>
  );
}
