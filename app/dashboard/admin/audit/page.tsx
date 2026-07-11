import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { AuditLog } from "@/lib/types";

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

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "admin") {
    redirectForRole(profile.role);
  }

  const { data } = await supabase
    .from("audit_logs")
    .select("id,actor_id,action,entity_type,entity_id,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<AuditLog[]>();

  const action = params.action?.trim() ?? "";
  const logs = (data ?? []).filter((log) => !action || log.action === action);
  const actions = Array.from(new Set((data ?? []).map((log) => log.action))).sort();

  return (
    <DashboardShell profile={profile} activeRole="admin">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Audit log
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Review high-signal platform activity.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
          Major project, inquiry, review, save, and message actions are recorded
          for operator visibility.
        </p>
      </section>

      <form className="mt-8 flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#dfe5dc] sm:flex-row">
        <select
          name="action"
          defaultValue={action}
          className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
        >
          <option value="">All actions</option>
          {actions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
        {logs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-[#e2e8df] text-[#5b6a61]">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Action</th>
                  <th className="py-3 pr-4 font-semibold">Entity</th>
                  <th className="py-3 pr-4 font-semibold">Actor</th>
                  <th className="py-3 pr-4 font-semibold">Metadata</th>
                  <th className="py-3 pr-4 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ece3]">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 pr-4 font-semibold">{log.action}</td>
                    <td className="py-3 pr-4">
                      {log.entity_type}
                      {log.entity_id ? ` · ${log.entity_id.slice(0, 8)}` : ""}
                    </td>
                    <td className="py-3 pr-4">
                      {log.actor_id ? log.actor_id.slice(0, 8) : "System"}
                    </td>
                    <td className="max-w-sm truncate py-3 pr-4">
                      {JSON.stringify(log.metadata ?? {})}
                    </td>
                    <td className="py-3 pr-4">{formatDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No audit entries yet."
            detail="Audit entries will appear as users create projects, submit interest, message, save projects, and admin review listings."
          />
        )}
      </section>
    </DashboardShell>
  );
}
