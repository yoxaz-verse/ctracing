import Link from "next/link";
import { CarbonEstimator } from "@/app/_components/CarbonEstimator";
import { saveProjectEstimate } from "@/app/dashboard/actions";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { getSessionProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardEstimatorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; savedEstimateId?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await getSessionProfile();

  return (
    <DashboardShell profile={profile} activeRole={profile.role}>
      <section className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Estimator
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Carbon credit pre-feasibility calculator.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
          Save exploratory estimates to your workspace. Sellers can turn saved
          estimates into draft project listings without making certified credit
          claims.
        </p>
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
        {params.savedEstimateId ? (
          <div className="mt-5 rounded-2xl border border-[#c8d2c2] bg-white p-4 text-sm text-[#314239]">
            <p className="font-semibold">Estimate saved.</p>
            {profile.role === "seller" ? (
              <Link
                href={`/dashboard/seller/projects/new?estimateId=${params.savedEstimateId}`}
                className="mt-3 inline-flex rounded-full bg-[#214d35] px-4 py-2 text-sm font-semibold text-white"
              >
                Start draft project from this estimate
              </Link>
            ) : (
              <p className="mt-2 text-[#5b6a61]">
                Saved estimates are available for workspace records and admin
                review.
              </p>
            )}
          </div>
        ) : null}
      </section>

      <CarbonEstimator
        mode="dashboard"
        userRole={profile.role}
        saveAction={saveProjectEstimate}
        redirectTo="/dashboard/estimator"
      />
    </DashboardShell>
  );
}
