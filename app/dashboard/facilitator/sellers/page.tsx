import {
  assignFacilitatorParticipant,
  createManagedParticipant,
  linkManagedParticipantToProfile,
} from "@/app/dashboard/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type {
  CarbonProject,
  FacilitatorManagedParticipant,
  FacilitatorOpportunity,
  Profile,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function formatCredits(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN").format(value ?? 0);
}

export default async function FacilitatorSellersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "facilitator") {
    redirectForRole(profile.role);
  }

  const [{ data: sellersData }, { data: managedData }, { data: projectsData }, { data: opportunitiesData }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id,email,role,company_name,contact_name,website,country,company_location,annual_credit_supply,project_methodologies,registry_experience,company_verification_status,email_verified_at")
        .eq("role", "seller")
        .returns<Profile[]>(),
      supabase
        .from("facilitator_managed_participants")
        .select("id,facilitator_id,participant_type,linked_profile_id,company_name,contact_name,email,phone,country,notes,created_at,updated_at")
        .eq("facilitator_id", profile.id)
        .eq("participant_type", "seller")
        .returns<FacilitatorManagedParticipant[]>(),
      supabase
        .from("carbon_projects")
        .select("id,seller_id,project_name,location,methodology,available_credits,price_per_credit,verification_status,lifecycle_status,documentation_score,created_at,updated_at")
        .returns<CarbonProject[]>(),
      supabase
        .from("facilitator_opportunities")
        .select("id,facilitator_id,buyer_profile_id,seller_profile_id,buyer_participant_id,seller_participant_id,project_id,interest_id,title,requested_credits,fit_score,stage,priority,facilitator_notes,next_action,closed_reason,created_at,updated_at")
        .eq("facilitator_id", profile.id)
        .returns<FacilitatorOpportunity[]>(),
    ]);

  const q = params.q?.trim().toLowerCase() ?? "";
  const sellers = (sellersData ?? []).filter(
    (seller) =>
      !q ||
      seller.email.toLowerCase().includes(q) ||
      (seller.company_name ?? "").toLowerCase().includes(q) ||
      (seller.country ?? "").toLowerCase().includes(q),
  );
  const managed = managedData ?? [];
  const projectsBySeller = new Map<string, CarbonProject[]>();
  for (const project of projectsData ?? []) {
    projectsBySeller.set(project.seller_id, [
      ...(projectsBySeller.get(project.seller_id) ?? []),
      project,
    ]);
  }
  const opportunities = opportunitiesData ?? [];

  return (
    <DashboardShell profile={profile} activeRole="facilitator">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Facilitator sellers
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Manage seller supply and handled accounts.
        </h1>
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.42fr_0.88fr]">
        <form action={createManagedParticipant} className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
          <input type="hidden" name="participantType" value="seller" />
          <input type="hidden" name="redirectTo" value="/dashboard/facilitator/sellers" />
          <h2 className="text-2xl font-semibold">Add managed seller</h2>
          <label className="mt-5 block">
            <span className="text-sm font-medium text-[#314239]">Company name</span>
            <input required name="companyName" className="mt-2 w-full rounded-2xl border border-[#cbd5c5] px-4 py-3" />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-[#314239]">Contact name</span>
            <input name="contactName" className="mt-2 w-full rounded-2xl border border-[#cbd5c5] px-4 py-3" />
          </label>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input name="email" type="email" placeholder="Email" className="rounded-2xl border border-[#cbd5c5] px-4 py-3" />
            <input name="country" placeholder="Country" className="rounded-2xl border border-[#cbd5c5] px-4 py-3" />
          </div>
          <input name="phone" placeholder="Phone" className="mt-4 w-full rounded-2xl border border-[#cbd5c5] px-4 py-3" />
          <textarea name="notes" rows={4} placeholder="Supply type, project maturity, verification notes." className="mt-4 w-full rounded-2xl border border-[#cbd5c5] px-4 py-3" />
          <PendingButton idleLabel="Add seller" pendingLabel="Adding..." className="mt-5 w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white" />
        </form>

        <div className="space-y-6">
          <form className="grid gap-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#dfe5dc] md:grid-cols-[1fr_auto]">
            <input name="q" defaultValue={params.q ?? ""} placeholder="Search seller company, email, country" className="rounded-2xl border border-[#cbd5c5] px-4 py-3" />
            <button className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white">Search</button>
          </form>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
            <h2 className="text-2xl font-semibold">Managed seller contacts</h2>
            <div className="mt-5 grid gap-4">
              {managed.length ? (
                managed.map((seller) => (
                  <article key={seller.id} className="rounded-2xl border border-[#e0e7dc] p-5">
                    <h3 className="font-semibold">{seller.company_name}</h3>
                    <p className="mt-1 text-sm text-[#6a756d]">{seller.contact_name || "No contact"} - {seller.email || "No email"}</p>
                    <p className="mt-3 text-sm leading-6 text-[#5b6a61]">{seller.notes || "No facilitator notes yet."}</p>
                    <form action={linkManagedParticipantToProfile} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                      <input type="hidden" name="participantId" value={seller.id} />
                      <input type="hidden" name="participantType" value="seller" />
                      <input type="hidden" name="redirectTo" value="/dashboard/facilitator/sellers" />
                      <select name="linkedProfileId" defaultValue={seller.linked_profile_id ?? ""} className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3">
                        <option value="">Link platform seller</option>
                        {sellers.map((profileRow) => (
                          <option key={profileRow.id} value={profileRow.id}>{profileRow.company_name || profileRow.email}</option>
                        ))}
                      </select>
                      <PendingButton idleLabel="Link" pendingLabel="Linking..." className="rounded-full border border-[#c8d2c2] px-5 py-3 text-sm font-semibold text-[#314239]" />
                    </form>
                  </article>
                ))
              ) : (
                <EmptyState title="No managed sellers yet." detail="Add seller companies that are not yet full platform accounts." />
              )}
            </div>
          </section>

          <section className="grid gap-5">
            {sellers.length ? (
              sellers.map((seller) => {
                const projects = projectsBySeller.get(seller.id) ?? [];
                const sellerOpportunities = opportunities.filter((item) => item.seller_profile_id === seller.id);
                const totalCredits = projects.reduce((sum, project) => sum + project.available_credits, 0);

                return (
                  <article key={seller.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge status={seller.company_verification_status ?? "pending"} />
                          <StatusBadge status={seller.role} />
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold">{seller.company_name || seller.email}</h2>
                        <p className="mt-2 text-sm text-[#6a756d]">{seller.country || "Country not provided"} - {seller.contact_name || "Contact not provided"}</p>
                      </div>
                      <form action={assignFacilitatorParticipant}>
                        <input type="hidden" name="assignmentScope" value="seller" />
                        <input type="hidden" name="targetId" value={seller.id} />
                        <input type="hidden" name="redirectTo" value="/dashboard/facilitator/sellers" />
                        <PendingButton idleLabel="Handle seller" pendingLabel="Assigning..." className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white" />
                      </form>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">Profile supply <span className="block font-semibold text-[#17201b]">{formatCredits(seller.annual_credit_supply)}</span></p>
                      <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">Project credits <span className="block font-semibold text-[#17201b]">{formatCredits(totalCredits)}</span></p>
                      <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">Matches <span className="block font-semibold text-[#17201b]">{sellerOpportunities.length}</span></p>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[#5b6a61]">{seller.project_methodologies || seller.registry_experience || "No seller supply notes yet."}</p>
                  </article>
                );
              })
            ) : (
              <EmptyState title="No seller profiles found." detail="Adjust search terms or add a managed seller contact." />
            )}
          </section>
        </div>
      </section>
    </DashboardShell>
  );
}
