import { PendingButton } from "@/app/_components/PendingButton";
import {
  respondToInterest,
  sendMarketplaceMessage,
} from "@/app/dashboard/actions";
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

type InquiryRow = BuyerInterest & {
  carbon_projects?: Pick<CarbonProject, "project_name" | "location"> | null;
};

function formatCredits(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export default async function SellerInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const [{ data: inquiriesData }, { data: messagesData }] = await Promise.all([
    supabase
      .from("buyer_interests")
      .select(
        "id,buyer_id,project_id,requested_credits,status,buyer_note,seller_response_note,updated_by,created_at,updated_at,carbon_projects(project_name,location)",
      )
      .order("updated_at", { ascending: false })
      .returns<InquiryRow[]>(),
    supabase
      .from("marketplace_messages")
      .select("id,interest_id,sender_id,message_body,created_at")
      .order("created_at", { ascending: true })
      .returns<MarketplaceMessage[]>(),
  ]);

  const messagesByInterest = new Map<string, MarketplaceMessage[]>();
  for (const message of messagesData ?? []) {
    messagesByInterest.set(message.interest_id, [
      ...(messagesByInterest.get(message.interest_id) ?? []),
      message,
    ]);
  }

  return (
    <DashboardShell profile={profile} activeRole="seller">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Seller inquiries
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Qualify and respond to buyer demand.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
          Move purchase-interest records through review, qualification, more
          information, and closed states.
        </p>
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-5">
        {inquiriesData?.length ? (
          inquiriesData.map((inquiry) => {
            const messages = messagesByInterest.get(inquiry.id) ?? [];

            return (
              <article
                key={inquiry.id}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]"
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_0.38fr]">
                  <div>
                    <StatusBadge status={inquiry.status} />
                    <h2 className="mt-4 text-2xl font-semibold">
                      {inquiry.carbon_projects?.project_name ?? "Project"}
                    </h2>
                    <p className="mt-2 text-sm text-[#6a756d]">
                      {inquiry.carbon_projects?.location}
                    </p>
                    <p className="mt-5 rounded-2xl bg-[#f3f6f0] p-4 text-sm leading-6 text-[#5b6a61]">
                      Buyer note: {inquiry.buyer_note || "No buyer note added."}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#e3eadf] p-5">
                    <p className="text-sm text-[#5b6a61]">Requested volume</p>
                    <p className="mt-1 text-2xl font-semibold text-[#214d35]">
                      {formatCredits(inquiry.requested_credits)}
                    </p>
                    <form action={respondToInterest} className="mt-5 space-y-3">
                      <input type="hidden" name="interestId" value={inquiry.id} />
                      <input
                        type="hidden"
                        name="redirectTo"
                        value="/dashboard/seller/inquiries"
                      />
                      <select
                        name="interestStatus"
                        defaultValue={inquiry.status}
                        className="w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                      >
                        <option value="seller_review">Seller review</option>
                        <option value="more_info_requested">
                          More info requested
                        </option>
                        <option value="qualified">Qualified</option>
                        <option value="closed">Closed</option>
                      </select>
                      <textarea
                        name="sellerResponseNote"
                        defaultValue={inquiry.seller_response_note ?? ""}
                        rows={4}
                        className="w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                        placeholder="Respond with documentation or next-step context."
                      />
                      <PendingButton
                        idleLabel="Update inquiry"
                        pendingLabel="Updating..."
                        className="w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
                      />
                    </form>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#e0e7dc] p-4">
                  <h3 className="font-semibold">Message thread</h3>
                  {messages.length ? (
                    <div className="mt-3 space-y-3">
                      {messages.map((message) => (
                        <p
                          key={message.id}
                          className="rounded-2xl bg-[#f3f6f0] p-3 text-sm leading-6 text-[#5b6a61]"
                        >
                          {message.message_body}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-[#5b6a61]">
                      No messages yet.
                    </p>
                  )}
                  <form action={sendMarketplaceMessage} className="mt-4">
                    <input type="hidden" name="interestId" value={inquiry.id} />
                    <input
                      type="hidden"
                      name="redirectTo"
                      value="/dashboard/seller/inquiries"
                    />
                    <textarea
                      required
                      name="messageBody"
                      rows={3}
                      className="w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                      placeholder="Send a message to the buyer."
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
            title="No buyer inquiries yet."
            detail="Buyer purchase-interest records for your projects will appear here."
          />
        )}
      </section>
    </DashboardShell>
  );
}
