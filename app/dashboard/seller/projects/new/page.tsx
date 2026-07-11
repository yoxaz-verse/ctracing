import Link from "next/link";
import { PendingButton } from "@/app/_components/PendingButton";
import { createProject } from "@/app/dashboard/actions";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import { SellerProjectFields } from "../_components/SellerProjectFields";

export const dynamic = "force-dynamic";

export default async function NewSellerProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
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
          New project
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Create draft project
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
              Capture overview, carbon details, pricing, registry context, and
              documentation details before submitting for admin review.
            </p>
          </div>
          <Link
            href="/dashboard/seller/projects"
            className="inline-flex rounded-full border border-[#c8d2c2] px-5 py-3 text-sm font-semibold text-[#314239]"
          >
            Back to projects
          </Link>
        </div>
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
        <form action={createProject}>
          <SellerProjectFields redirectTo="/dashboard/seller/projects" />
          <PendingButton
            idleLabel="Create draft project"
            pendingLabel="Creating draft..."
            className="mt-5 rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
          />
        </form>
      </section>
    </DashboardShell>
  );
}
