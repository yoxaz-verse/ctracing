import { CompanyProfileForm } from "@/app/dashboard/_components/CompanyProfileForm";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { getSessionProfile, redirectForRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SellerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await getSessionProfile();

  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  return (
    <DashboardShell profile={profile} activeRole="seller">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Seller profile
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight">
          Maintain company and carbon supply details.
        </h1>
        {params.saved ? (
          <p className="mt-5 rounded-2xl bg-[#eef6ed] px-4 py-3 text-sm text-[#214d35]">
            Company profile saved.
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
          role="seller"
          redirectTo="/dashboard/seller/profile"
        />
      </div>
    </DashboardShell>
  );
}
