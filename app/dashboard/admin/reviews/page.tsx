import { PendingButton } from "@/app/_components/PendingButton";
import { adminReviewProject } from "@/app/dashboard/actions";
import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { CarbonProject, ProjectDocument, ProjectReview } from "@/lib/types";

export const dynamic = "force-dynamic";

type ReviewProject = CarbonProject & {
  profiles?: { company_name: string | null; email: string } | null;
};

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "admin") {
    redirectForRole(profile.role);
  }

  const [{ data: projectsData }, { data: documentsData }, { data: reviewsData }] =
    await Promise.all([
      supabase
        .from("carbon_projects")
        .select(
          "id,seller_id,project_name,location,methodology,available_credits,price_per_credit,verification_status,lifecycle_status,project_description,estimated_annual_credits,vintage_year,registry_name,documentation_score,created_at,updated_at,profiles(company_name,email)",
        )
        .in("lifecycle_status", ["submitted", "needs_review", "listed", "paused"])
        .order("updated_at", { ascending: false })
        .returns<ReviewProject[]>(),
      supabase
        .from("project_documents")
        .select("id,project_id,uploaded_by,document_name,document_category,document_url,review_status,created_at,updated_at")
        .returns<ProjectDocument[]>(),
      supabase
        .from("project_reviews")
        .select("id,project_id,reviewer_id,decision_status,review_note,created_at")
        .order("created_at", { ascending: false })
        .returns<ProjectReview[]>(),
    ]);

  const documentsByProject = new Map<string, ProjectDocument[]>();
  for (const document of documentsData ?? []) {
    documentsByProject.set(document.project_id, [
      ...(documentsByProject.get(document.project_id) ?? []),
      document,
    ]);
  }
  const latestReviewByProject = new Map<string, ProjectReview>();
  for (const review of reviewsData ?? []) {
    if (!latestReviewByProject.has(review.project_id)) {
      latestReviewByProject.set(review.project_id, review);
    }
  }

  return (
    <DashboardShell profile={profile} activeRole="admin">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Admin review queue
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Approve, pause, or request project updates.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
          Admin review controls when seller projects become listed in the buyer
          marketplace and public homepage previews.
        </p>
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-5">
        {projectsData?.length ? (
          projectsData.map((project) => {
            const documents = documentsByProject.get(project.id) ?? [];
            const latestReview = latestReviewByProject.get(project.id);

            return (
              <article
                key={project.id}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]"
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_0.38fr]">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={project.lifecycle_status} />
                      <StatusBadge status={project.verification_status} />
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold">
                      {project.project_name}
                    </h2>
                    <p className="mt-2 text-sm text-[#6a756d]">
                      {project.location} · {project.methodology}
                    </p>
                    <p className="mt-2 text-sm text-[#314239]">
                      Seller:{" "}
                      {project.profiles?.company_name ||
                        project.profiles?.email ||
                        project.seller_id}
                    </p>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-[#5b6a61]">
                      {project.project_description ||
                        "No project description has been submitted."}
                    </p>
                    <div className="mt-5 rounded-2xl bg-[#f3f6f0] p-4">
                      <p className="text-sm font-semibold">Documents</p>
                      <p className="mt-1 text-sm text-[#5b6a61]">
                        {documents.length} document metadata records attached.
                      </p>
                    </div>
                    {latestReview ? (
                      <div className="mt-3 rounded-2xl bg-[#eef6ed] p-4">
                        <p className="text-sm font-semibold">Latest review</p>
                        <p className="mt-1 text-sm text-[#5b6a61]">
                          {latestReview.decision_status}:{" "}
                          {latestReview.review_note || "No note"}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <form action={adminReviewProject} className="rounded-2xl bg-[#e3eadf] p-5">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input
                      type="hidden"
                      name="redirectTo"
                      value="/dashboard/admin/reviews"
                    />
                    <label className="text-sm font-medium text-[#314239]">
                      Review decision
                    </label>
                    <select
                      name="decisionStatus"
                      defaultValue={project.lifecycle_status ?? "needs_review"}
                      className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                    >
                      <option value="needs_review">Needs review</option>
                      <option value="listed">Listed</option>
                      <option value="paused">Paused</option>
                      <option value="archived">Archived</option>
                    </select>
                    <textarea
                      name="reviewNote"
                      rows={5}
                      className="mt-3 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                      placeholder="Admin review note"
                    />
                    <PendingButton
                      idleLabel="Save review"
                      pendingLabel="Saving review..."
                      className="mt-3 w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
                    />
                  </form>
                </div>
              </article>
            );
          })
        ) : (
          <EmptyState
            title="No projects are waiting for review."
            detail="Seller projects appear here after they are submitted for review."
          />
        )}
      </section>
    </DashboardShell>
  );
}
