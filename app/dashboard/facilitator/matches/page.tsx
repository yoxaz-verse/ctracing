import {
  closeFacilitatorOpportunity,
  createFacilitatorOpportunity,
  updateFacilitatorOpportunity,
} from "@/app/dashboard/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type {
  BuyerInterest,
  CarbonProject,
  FacilitatorManagedParticipant,
  FacilitatorOpportunity,
  Profile,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const stages = [
  "draft",
  "screening",
  "buyer_contacted",
  "seller_contacted",
  "matched",
  "negotiation",
  "closed_won",
  "closed_lost",
];

function formatCredits(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN").format(value ?? 0);
}

export default async function FacilitatorMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; stage?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "facilitator") {
    redirectForRole(profile.role);
  }

  const [
    { data: profileRows },
    { data: projectRows },
    { data: interestRows },
    { data: participantRows },
    { data: opportunityRows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,role,company_name,contact_name,country,company_location,company_verification_status,email_verified_at")
      .in("role", ["buyer", "seller"])
      .returns<Profile[]>(),
    supabase
      .from("carbon_projects")
      .select("id,seller_id,project_name,location,methodology,available_credits,price_per_credit,verification_status,lifecycle_status,documentation_score,created_at,updated_at")
      .in("lifecycle_status", ["listed", "submitted", "needs_review"])
      .returns<CarbonProject[]>(),
    supabase
      .from("buyer_interests")
      .select("id,buyer_id,project_id,requested_credits,status,buyer_note,seller_response_note,updated_by,created_at,updated_at")
      .returns<BuyerInterest[]>(),
    supabase
      .from("facilitator_managed_participants")
      .select("id,facilitator_id,participant_type,linked_profile_id,company_name,contact_name,email,phone,country,notes,created_at,updated_at")
      .eq("facilitator_id", profile.id)
      .returns<FacilitatorManagedParticipant[]>(),
    supabase
      .from("facilitator_opportunities")
      .select("id,facilitator_id,buyer_profile_id,seller_profile_id,buyer_participant_id,seller_participant_id,project_id,interest_id,title,requested_credits,fit_score,stage,priority,facilitator_notes,next_action,closed_reason,created_at,updated_at")
      .eq("facilitator_id", profile.id)
      .order("updated_at", { ascending: false })
      .returns<FacilitatorOpportunity[]>(),
  ]);

  const profiles = profileRows ?? [];
  const buyers = profiles.filter((item) => item.role === "buyer");
  const sellers = profiles.filter((item) => item.role === "seller");
  const projects = projectRows ?? [];
  const interests = interestRows ?? [];
  const participants = participantRows ?? [];
  const buyerParticipants = participants.filter((item) => item.participant_type === "buyer");
  const sellerParticipants = participants.filter((item) => item.participant_type === "seller");
  const stage = params.stage?.trim() ?? "";
  const opportunities = (opportunityRows ?? []).filter(
    (item) => !stage || item.stage === stage,
  );
  const profilesById = new Map(profiles.map((item) => [item.id, item]));
  const projectsById = new Map(projects.map((item) => [item.id, item]));
  const participantsById = new Map(participants.map((item) => [item.id, item]));

  return (
    <DashboardShell profile={profile} activeRole="facilitator">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Match pipeline
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Create and progress credible opportunities.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
          Link buyer demand, seller supply, managed contacts, and project
          signals into a facilitator-owned opportunity.
        </p>
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.48fr_0.82fr]">
        <form
          action={createFacilitatorOpportunity}
          className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]"
        >
          <h2 className="text-2xl font-semibold">New opportunity</h2>
          <input type="hidden" name="redirectTo" value="/dashboard/facilitator/matches" />
          <label className="mt-5 block">
            <span className="text-sm font-medium text-[#314239]">Title</span>
            <input
              required
              name="title"
              className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
              placeholder="Enterprise buyer fit for verified ARR supply"
            />
          </label>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-sm font-medium text-[#314239]">Buyer account</span>
              <select name="buyerProfileId" className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3">
                <option value="">Not linked</option>
                {buyers.map((buyer) => (
                  <option key={buyer.id} value={buyer.id}>
                    {buyer.company_name || buyer.email}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-medium text-[#314239]">Seller account</span>
              <select name="sellerProfileId" className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3">
                <option value="">Not linked</option>
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.company_name || seller.email}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-medium text-[#314239]">Managed buyer</span>
              <select name="buyerParticipantId" className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3">
                <option value="">Not linked</option>
                {buyerParticipants.map((buyer) => (
                  <option key={buyer.id} value={buyer.id}>
                    {buyer.company_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-medium text-[#314239]">Managed seller</span>
              <select name="sellerParticipantId" className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3">
                <option value="">Not linked</option>
                {sellerParticipants.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.company_name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-[#314239]">Project supply</span>
            <select name="projectId" className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3">
              <option value="">No project selected</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_name} - {formatCredits(project.available_credits)} credits
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-[#314239]">Buyer interest</span>
            <select name="interestId" className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3">
              <option value="">No interest selected</option>
              {interests.map((interest) => (
                <option key={interest.id} value={interest.id}>
                  {formatCredits(interest.requested_credits)} credits - {interest.status}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label>
              <span className="text-sm font-medium text-[#314239]">Requested credits</span>
              <input name="requestedCredits" type="number" min="1" className="mt-2 w-full rounded-2xl border border-[#cbd5c5] px-4 py-3" />
            </label>
            <label>
              <span className="text-sm font-medium text-[#314239]">Fit score</span>
              <input name="fitScore" type="number" min="0" max="100" defaultValue="50" className="mt-2 w-full rounded-2xl border border-[#cbd5c5] px-4 py-3" />
            </label>
            <label>
              <span className="text-sm font-medium text-[#314239]">Priority</span>
              <select name="priority" defaultValue="medium" className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-[#314239]">Next action</span>
            <input name="nextAction" className="mt-2 w-full rounded-2xl border border-[#cbd5c5] px-4 py-3" placeholder="Schedule buyer-seller intro call" />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-[#314239]">Facilitator notes</span>
            <textarea name="facilitatorNotes" rows={4} className="mt-2 w-full rounded-2xl border border-[#cbd5c5] px-4 py-3" placeholder="Why this match is credible." />
          </label>
          <PendingButton
            idleLabel="Create opportunity"
            pendingLabel="Creating..."
            className="mt-5 w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
          />
        </form>

        <div>
          <form className="grid gap-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#dfe5dc] md:grid-cols-[1fr_auto]">
            <select name="stage" defaultValue={stage} className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3">
              <option value="">All stages</option>
              {stages.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <button className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white">
              Filter
            </button>
          </form>

          <div className="mt-5 grid gap-5">
            {opportunities.length ? (
              opportunities.map((opportunity) => {
                const buyer = opportunity.buyer_profile_id ? profilesById.get(opportunity.buyer_profile_id) : null;
                const seller = opportunity.seller_profile_id ? profilesById.get(opportunity.seller_profile_id) : null;
                const managedBuyer = opportunity.buyer_participant_id ? participantsById.get(opportunity.buyer_participant_id) : null;
                const managedSeller = opportunity.seller_participant_id ? participantsById.get(opportunity.seller_participant_id) : null;
                const project = opportunity.project_id ? projectsById.get(opportunity.project_id) : null;

                return (
                  <article key={opportunity.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge status={opportunity.stage} />
                          <StatusBadge status={opportunity.priority} />
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold">{opportunity.title}</h2>
                        <p className="mt-2 text-sm text-[#6a756d]">
                          {(buyer?.company_name || managedBuyer?.company_name || "Buyer TBD")} to{" "}
                          {(seller?.company_name || managedSeller?.company_name || "Seller TBD")}
                        </p>
                      </div>
                      <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                        Fit score <span className="block text-lg font-semibold text-[#17201b]">{opportunity.fit_score}/100</span>
                      </p>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                        Credits <span className="block font-semibold text-[#17201b]">{formatCredits(opportunity.requested_credits)}</span>
                      </p>
                      <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                        Project <span className="block font-semibold text-[#17201b]">{project?.project_name || "Not selected"}</span>
                      </p>
                      <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                        Next <span className="block font-semibold text-[#17201b]">{opportunity.next_action || "Not set"}</span>
                      </p>
                    </div>
                    <form action={updateFacilitatorOpportunity} className="mt-5 grid gap-4 md:grid-cols-4">
                      <input type="hidden" name="opportunityId" value={opportunity.id} />
                      <input type="hidden" name="redirectTo" value="/dashboard/facilitator/matches" />
                      <select name="stage" defaultValue={opportunity.stage} className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3">
                        {stages.map((item) => (
                          <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
                        ))}
                      </select>
                      <select name="priority" defaultValue={opportunity.priority} className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <input name="fitScore" type="number" min="0" max="100" defaultValue={opportunity.fit_score} className="rounded-2xl border border-[#cbd5c5] px-4 py-3" />
                      <input name="nextAction" defaultValue={opportunity.next_action ?? ""} className="rounded-2xl border border-[#cbd5c5] px-4 py-3" placeholder="Next action" />
                      <textarea name="facilitatorNotes" rows={3} defaultValue={opportunity.facilitator_notes ?? ""} className="md:col-span-4 rounded-2xl border border-[#cbd5c5] px-4 py-3" />
                      <PendingButton idleLabel="Update match" pendingLabel="Updating..." className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white md:col-span-2" />
                    </form>
                    <form action={closeFacilitatorOpportunity} className="mt-3 grid gap-3 md:grid-cols-[0.35fr_1fr_auto]">
                      <input type="hidden" name="opportunityId" value={opportunity.id} />
                      <input type="hidden" name="redirectTo" value="/dashboard/facilitator/matches" />
                      <select name="stage" defaultValue="closed_won" className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3">
                        <option value="closed_won">Closed won</option>
                        <option value="closed_lost">Closed lost</option>
                      </select>
                      <input name="closedReason" defaultValue={opportunity.closed_reason ?? ""} className="rounded-2xl border border-[#cbd5c5] px-4 py-3" placeholder="Close reason" />
                      <PendingButton idleLabel="Close" pendingLabel="Closing..." className="rounded-full border border-[#c8d2c2] px-5 py-3 text-sm font-semibold text-[#314239]" />
                    </form>
                  </article>
                );
              })
            ) : (
              <EmptyState
                title="No opportunities in this view."
                detail="Create a match or adjust the stage filter."
              />
            )}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
