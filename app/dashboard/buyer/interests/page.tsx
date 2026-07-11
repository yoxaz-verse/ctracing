import { PendingButton } from "@/app/_components/PendingButton";
import { sendMarketplaceMessage } from "@/app/dashboard/actions";
import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type {
  BuyerInterest,
  CarbonProject,
  MarketplaceMessage,
} from "@/lib/types";

export const dynamic = "force-dynamic";

type InterestRow = BuyerInterest & {
  carbon_projects?: Pick<
    CarbonProject,
    "project_name" | "location" | "methodology" | "verification_status"
  > | null;
};

function formatCredits(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export default async function BuyerInterestsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "buyer") {
    redirectForRole(profile.role);
  }

  const [{ data: interestsData }, { data: messagesData }] = await Promise.all([
    supabase
      .from("buyer_interests")
      .select(
        "id,buyer_id,project_id,requested_credits,status,buyer_note,seller_response_note,updated_by,created_at,updated_at,carbon_projects(project_name,location,methodology,verification_status)",
      )
      .eq("buyer_id", profile.id)
      .order("updated_at", { ascending: false })
      .returns<InterestRow[]>(),
    supabase
      .from("marketplace_messages")
      .select("id,interest_id,sender_id,message_body,created_at")
      .order("created_at", { ascending: true })
      .returns<MarketplaceMessage[]>(),
  ]);

  const status = params.status ?? "";
  const interests = (interestsData ?? []).filter(
    (interest) => !status || interest.status === status,
  );
  const messagesByInterest = new Map<string, MarketplaceMessage[]>();
  for (const message of messagesData ?? []) {
    messagesByInterest.set(message.interest_id, [
      ...(messagesByInterest.get(message.interest_id) ?? []),
      message,
    ]);
  }

  return (
    <DashboardShell profile={profile} activeRole="buyer">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.34fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
            Interest pipeline
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Track purchase-interest conversations.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
            Review seller responses, status changes, and message history for
            each project inquiry.
          </p>
          {params.error ? (
            <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
              {params.error}
            </p>
          ) : null}
        </div>
        <form className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
          <label className="text-sm font-medium text-[#314239]">
            Pipeline filter
          </label>
          <select
            name="status"
            defaultValue={status}
            className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
          >
            <option value="">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="seller_review">Seller review</option>
            <option value="more_info_requested">More info requested</option>
            <option value="qualified">Qualified</option>
            <option value="closed">Closed</option>
          </select>
          <button className="mt-4 w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white">
            Apply filter
          </button>
        </form>
      </section>

      <section className="mt-8 grid gap-5">
        {interests.length ? (
          interests.map((interest) => {
            const messages = messagesByInterest.get(interest.id) ?? [];

            return (
              <article
                key={interest.id}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <StatusBadge status={interest.status} />
                    <h2 className="mt-4 text-2xl font-semibold">
                      {interest.carbon_projects?.project_name ?? "Project"}
                    </h2>
                    <p className="mt-2 text-sm text-[#6a756d]">
                      {interest.carbon_projects?.location} ·{" "}
                      {interest.carbon_projects?.methodology}
                    </p>
                  </div>
                  <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                    Requested credits{" "}
                    <span className="block text-lg font-semibold text-[#17201b]">
                      {formatCredits(interest.requested_credits)}
                    </span>
                  </p>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-[#f3f6f0] p-4">
                    <p className="text-sm font-semibold">Buyer note</p>
                    <p className="mt-2 text-sm leading-6 text-[#5b6a61]">
                      {interest.buyer_note || "No note added."}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#eef6ed] p-4">
                    <p className="text-sm font-semibold">Seller response</p>
                    <p className="mt-2 text-sm leading-6 text-[#5b6a61]">
                      {interest.seller_response_note ||
                        "Seller has not responded yet."}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#e0e7dc] p-4">
                  <h3 className="font-semibold">Message thread</h3>
                  {messages.length ? (
                    <div className="mt-3 space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className="rounded-2xl bg-[#f3f6f0] p-3 text-sm leading-6 text-[#5b6a61]"
                        >
                          {message.message_body}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-[#5b6a61]">
                      No messages yet.
                    </p>
                  )}
                  <form action={sendMarketplaceMessage} className="mt-4">
                    <input type="hidden" name="interestId" value={interest.id} />
                    <input
                      type="hidden"
                      name="redirectTo"
                      value="/dashboard/buyer/interests"
                    />
                    <textarea
                      required
                      name="messageBody"
                      rows={3}
                      className="w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                      placeholder="Ask a question or add context for the seller."
                    />
                    <PendingButton
                      idleLabel="Send message"
                      pendingLabel="Sending..."
                      className="mt-3 rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
                    />
                  </form>
                </div>
              </article>
            );
          })
        ) : (
          <EmptyState
            title="No purchase-interest records in this view."
            detail="Submit interest from the project discovery page, then track seller response and messages here."
          />
        )}
      </section>
    </DashboardShell>
  );
}
