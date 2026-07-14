import { sendFacilitatorMessage } from "@/app/dashboard/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type {
  FacilitatorMessage,
  FacilitatorOpportunity,
  Profile,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function formatDate(value: string | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function FacilitatorMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "facilitator") {
    redirectForRole(profile.role);
  }

  const [{ data: opportunityRows }, { data: messageRows }, { data: profileRows }] =
    await Promise.all([
      supabase
        .from("facilitator_opportunities")
        .select("id,facilitator_id,buyer_profile_id,seller_profile_id,buyer_participant_id,seller_participant_id,project_id,interest_id,title,requested_credits,fit_score,stage,priority,facilitator_notes,next_action,closed_reason,created_at,updated_at")
        .eq("facilitator_id", profile.id)
        .order("updated_at", { ascending: false })
        .returns<FacilitatorOpportunity[]>(),
      supabase
        .from("facilitator_messages")
        .select("id,opportunity_id,sender_id,message_body,created_at")
        .order("created_at", { ascending: true })
        .returns<FacilitatorMessage[]>(),
      supabase
        .from("profiles")
        .select("id,email,role,company_name")
        .returns<Profile[]>(),
    ]);

  const opportunities = opportunityRows ?? [];
  const profilesById = new Map((profileRows ?? []).map((item) => [item.id, item]));
  const messagesByOpportunity = new Map<string, FacilitatorMessage[]>();
  for (const message of messageRows ?? []) {
    messagesByOpportunity.set(message.opportunity_id, [
      ...(messagesByOpportunity.get(message.opportunity_id) ?? []),
      message,
    ]);
  }

  return (
    <DashboardShell profile={profile} activeRole="facilitator">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Facilitator messages
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Keep opportunity context attached to every match.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
          Use these notes and messages for facilitator-managed opportunities
          before or alongside formal buyer-seller inquiry threads.
        </p>
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-5">
        {opportunities.length ? (
          opportunities.map((opportunity) => {
            const messages = messagesByOpportunity.get(opportunity.id) ?? [];

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
                      Next action: {opportunity.next_action || "Not set"}
                    </p>
                  </div>
                  <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                    Messages <span className="block text-lg font-semibold text-[#17201b]">{messages.length}</span>
                  </p>
                </div>
                <div className="mt-5 rounded-2xl border border-[#e0e7dc] p-4">
                  {messages.length ? (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const sender = profilesById.get(message.sender_id);
                        return (
                          <div key={message.id} className="rounded-2xl bg-[#f3f6f0] p-4">
                            <p className="text-sm font-semibold text-[#314239]">
                              {sender?.company_name || sender?.email || "Facilitator"} - {formatDate(message.created_at)}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#5b6a61]">{message.message_body}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-[#5b6a61]">No opportunity messages yet.</p>
                  )}
                  <form action={sendFacilitatorMessage} className="mt-4">
                    <input type="hidden" name="opportunityId" value={opportunity.id} />
                    <input type="hidden" name="redirectTo" value="/dashboard/facilitator/messages" />
                    <textarea required name="messageBody" rows={3} className="w-full rounded-2xl border border-[#cbd5c5] px-4 py-3" placeholder="Add context, meeting notes, or a next-step update." />
                    <PendingButton idleLabel="Send message" pendingLabel="Sending..." className="mt-3 rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white" />
                  </form>
                </div>
              </article>
            );
          })
        ) : (
          <EmptyState title="No opportunities to message yet." detail="Create a facilitator opportunity before adding match context." />
        )}
      </section>
    </DashboardShell>
  );
}
