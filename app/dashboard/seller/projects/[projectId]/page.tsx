import Link from "next/link";
import { redirect } from "next/navigation";
import { PendingButton } from "@/app/_components/PendingButton";
import {
  addProjectDocument,
  deleteProject,
  submitProjectForReview,
  updateProject,
} from "@/app/dashboard/actions";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { CarbonProject, ProjectDocument } from "@/lib/types";
import { SellerProjectFields } from "../_components/SellerProjectFields";

export const dynamic = "force-dynamic";

export default async function EditSellerProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const [{ data: project }, { data: documentsData }] = await Promise.all([
    supabase
      .from("carbon_projects")
      .select(
        "id,seller_id,project_name,location,methodology,available_credits,price_per_credit,verification_status,lifecycle_status,project_description,estimated_annual_credits,vintage_year,registry_name,documentation_score,created_at,updated_at",
      )
      .eq("id", projectId)
      .eq("seller_id", profile.id)
      .maybeSingle<CarbonProject>(),
    supabase
      .from("project_documents")
      .select(
        "id,project_id,uploaded_by,document_name,document_category,document_url,review_status,created_at,updated_at",
      )
      .eq("project_id", projectId)
      .returns<ProjectDocument[]>(),
  ]);

  if (!project) {
    redirect("/dashboard/seller/projects");
  }

  const documents = documentsData ?? [];
  const editPath = `/dashboard/seller/projects/${project.id}`;

  return (
    <DashboardShell profile={profile} activeRole="seller">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Edit project
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={project.lifecycle_status} />
              <StatusBadge status={project.verification_status} />
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              {project.project_name}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
              Edit project details, add documentation metadata, and submit the
              draft for admin review when it is ready.
            </p>
          </div>
          <Link
            href="/dashboard/seller/projects"
            className="inline-flex rounded-full border border-[#c8d2c2] px-5 py-3 text-sm font-semibold text-[#314239]"
          >
            Back to projects
          </Link>
        </div>
        {query.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {query.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
        <h2 className="text-2xl font-semibold">Project details</h2>
        <form action={updateProject} className="mt-5">
          <SellerProjectFields project={project} redirectTo={editPath} />
          <div className="mt-5 flex flex-wrap gap-3">
            <PendingButton
              idleLabel="Save project"
              pendingLabel="Saving..."
              className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
            />
          </div>
        </form>
        <div className="mt-3 flex flex-wrap gap-3">
          {project.lifecycle_status === "listed" ? null : (
            <form action={submitProjectForReview}>
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="redirectTo" value={editPath} />
              <PendingButton
                idleLabel="Submit for admin review"
                pendingLabel="Submitting..."
                className="rounded-full border border-[#c8d2c2] px-5 py-3 text-sm font-semibold text-[#314239]"
              />
            </form>
          )}
          <form action={deleteProject}>
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="redirectTo" value="/dashboard/seller/projects" />
            <PendingButton
              idleLabel="Delete project"
              pendingLabel="Deleting..."
              className="rounded-full border border-[#d8b8ad] px-5 py-3 text-sm font-semibold text-[#8a2c16]"
            />
          </form>
        </div>
      </section>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
        <h2 className="text-2xl font-semibold">Project documents</h2>
        <div className="mt-5 grid gap-3">
          {documents.length ? (
            documents.map((document) => (
              <article
                key={document.id}
                className="rounded-2xl bg-[#f3f6f0] p-4 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{document.document_name}</p>
                    <p className="mt-1 text-[#6a756d]">
                      {document.document_category}
                    </p>
                  </div>
                  <StatusBadge status={document.review_status} />
                </div>
                {document.document_url ? (
                  <p className="mt-3 break-all text-[#5b6a61]">
                    {document.document_url}
                  </p>
                ) : null}
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-[#cbd5c5] p-5 text-sm leading-6 text-[#5b6a61]">
              No document metadata added yet. Add links or paths for project
              packets, registry evidence, monitoring documents, and due
              diligence notes.
            </p>
          )}
        </div>
        <form action={addProjectDocument} className="mt-5 grid gap-3 md:grid-cols-3">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="redirectTo" value={editPath} />
          <input
            required
            name="documentName"
            className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
            placeholder="Document name"
          />
          <input
            name="documentCategory"
            className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
            placeholder="Category"
          />
          <input
            name="documentUrl"
            className="rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
            placeholder="Document URL/path"
          />
          <PendingButton
            idleLabel="Add document"
            pendingLabel="Adding..."
            className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white md:col-span-3"
          />
        </form>
      </section>
    </DashboardShell>
  );
}
