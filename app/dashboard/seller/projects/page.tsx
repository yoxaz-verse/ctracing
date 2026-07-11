import { PendingButton } from "@/app/_components/PendingButton";
import {
  addProjectDocument,
  createProject,
  deleteProject,
  submitProjectForReview,
  updateProject,
} from "@/app/dashboard/actions";
import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { CarbonProject, ProjectDocument } from "@/lib/types";

export const dynamic = "force-dynamic";

const verificationStatuses = [
  "Documentation review",
  "Registry pending",
  "Verified supply",
  "Buyer due diligence",
];

function formatCredits(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN").format(value ?? 0);
}

function ProjectFields({ project }: { project?: CarbonProject }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {project ? <input type="hidden" name="projectId" value={project.id} /> : null}
      <input type="hidden" name="redirectTo" value="/dashboard/seller/projects" />
      <label className="md:col-span-2">
        <span className="text-sm font-medium text-[#314239]">Project name</span>
        <input
          required
          name="projectName"
          defaultValue={project?.project_name}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
          placeholder="Western Ghats Afforestation Corridor"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[#314239]">Location</span>
        <input
          required
          name="location"
          defaultValue={project?.location}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
          placeholder="Karnataka, India"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[#314239]">Methodology</span>
        <input
          required
          name="methodology"
          defaultValue={project?.methodology}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
          placeholder="ARR - Afforestation"
        />
      </label>
      <label className="md:col-span-2">
        <span className="text-sm font-medium text-[#314239]">
          Project description
        </span>
        <textarea
          name="projectDescription"
          defaultValue={project?.project_description ?? ""}
          rows={4}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
          placeholder="Describe project boundaries, implementation stage, and documentation basis."
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[#314239]">
          Available credits
        </span>
        <input
          required
          min="1"
          name="availableCredits"
          type="number"
          defaultValue={project?.available_credits}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[#314239]">
          Estimated annual credits
        </span>
        <input
          min="0"
          name="estimatedAnnualCredits"
          type="number"
          defaultValue={project?.estimated_annual_credits ?? ""}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[#314239]">
          Indicative price per credit
        </span>
        <input
          required
          min="0.01"
          step="0.01"
          name="pricePerCredit"
          type="number"
          defaultValue={project?.price_per_credit}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[#314239]">Vintage year</span>
        <input
          min="1990"
          max="2100"
          name="vintageYear"
          type="number"
          defaultValue={project?.vintage_year ?? ""}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[#314239]">Registry name</span>
        <input
          name="registryName"
          defaultValue={project?.registry_name ?? ""}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
          placeholder="Verra, Gold Standard, internal registry"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[#314239]">
          Documentation score
        </span>
        <input
          min="0"
          max="100"
          name="documentationScore"
          type="number"
          defaultValue={project?.documentation_score ?? 0}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[#314239]">
          Verification status
        </span>
        <select
          name="verificationStatus"
          defaultValue={project?.verification_status ?? verificationStatuses[0]}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
        >
          {verificationStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="text-sm font-medium text-[#314239]">
          Lifecycle status
        </span>
        <select
          name="lifecycleStatus"
          defaultValue={project?.lifecycle_status ?? "draft"}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
        >
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="needs_review">Needs review</option>
          <option value="listed">Listed</option>
          <option value="paused">Paused</option>
          <option value="archived">Archived</option>
        </select>
      </label>
    </div>
  );
}

export default async function SellerProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const [{ data: projectsData }, { data: documentsData }] = await Promise.all([
    supabase
      .from("carbon_projects")
      .select(
        "id,seller_id,project_name,location,methodology,available_credits,price_per_credit,verification_status,lifecycle_status,project_description,estimated_annual_credits,vintage_year,registry_name,documentation_score,created_at,updated_at",
      )
      .eq("seller_id", profile.id)
      .order("created_at", { ascending: false })
      .returns<CarbonProject[]>(),
    supabase
      .from("project_documents")
      .select("id,project_id,uploaded_by,document_name,document_category,document_url,review_status,created_at,updated_at")
      .returns<ProjectDocument[]>(),
  ]);

  const projects = projectsData ?? [];
  const documentsByProject = new Map<string, ProjectDocument[]>();
  for (const document of documentsData ?? []) {
    documentsByProject.set(document.project_id, [
      ...(documentsByProject.get(document.project_id) ?? []),
      document,
    ]);
  }

  return (
    <DashboardShell profile={profile} activeRole="seller">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Seller project builder
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Build complete project listings for admin review.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
          Maintain overview, carbon details, pricing, registry context,
          documentation score, and project documents before listing.
        </p>
        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
        <h2 className="text-2xl font-semibold">Create draft listing</h2>
        <form action={createProject} className="mt-5">
          <ProjectFields />
          <PendingButton
            idleLabel="Create draft project"
            pendingLabel="Creating project..."
            className="mt-5 rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
          />
        </form>
      </section>

      <section className="mt-8 grid gap-5">
        {projects.length ? (
          projects.map((project) => {
            const docs = documentsByProject.get(project.id) ?? [];

            return (
              <article
                key={project.id}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
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
                  </div>
                  <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                    Documentation score{" "}
                    <span className="block text-lg font-semibold text-[#17201b]">
                      {project.documentation_score ?? 0}/100
                    </span>
                  </p>
                </div>

                <form action={updateProject} className="mt-6">
                  <ProjectFields project={project} />
                  <div className="mt-5 flex flex-wrap gap-3">
                    <PendingButton
                      idleLabel="Save project"
                      pendingLabel="Saving..."
                      className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
                    />
                  </div>
                </form>
                <div className="mt-3 flex flex-wrap gap-3">
                  <form action={submitProjectForReview}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <input
                      type="hidden"
                      name="redirectTo"
                      value="/dashboard/seller/projects"
                    />
                    <PendingButton
                      idleLabel="Submit for admin review"
                      pendingLabel="Submitting..."
                      className="rounded-full border border-[#c8d2c2] px-5 py-3 text-sm font-semibold text-[#314239]"
                    />
                  </form>
                  <form action={deleteProject}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <input
                      type="hidden"
                      name="redirectTo"
                      value="/dashboard/seller/projects"
                    />
                    <PendingButton
                      idleLabel="Delete"
                      pendingLabel="Deleting..."
                      className="rounded-full border border-[#d8b8ad] px-5 py-3 text-sm font-semibold text-[#8a2c16]"
                    />
                  </form>
                </div>

                <div className="mt-6 rounded-2xl bg-[#f3f6f0] p-5">
                  <h3 className="font-semibold">Project documents</h3>
                  <div className="mt-4 grid gap-3">
                    {docs.length ? (
                      docs.map((document) => (
                        <div
                          key={document.id}
                          className="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-[#dfe5dc]"
                        >
                          <p className="font-semibold">{document.document_name}</p>
                          <p className="mt-1 text-[#6a756d]">
                            {document.document_category} · {document.review_status}
                          </p>
                          {document.document_url ? (
                            <p className="mt-1 break-all text-[#5b6a61]">
                              {document.document_url}
                            </p>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[#5b6a61]">
                        No document metadata added yet.
                      </p>
                    )}
                  </div>
                  <form action={addProjectDocument} className="mt-4 grid gap-3 md:grid-cols-3">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input
                      type="hidden"
                      name="redirectTo"
                      value="/dashboard/seller/projects"
                    />
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
                </div>
              </article>
            );
          })
        ) : (
          <EmptyState
            title="No project listings yet."
            detail="Create a draft listing above, add documentation metadata, then submit it for admin review."
          />
        )}
      </section>
    </DashboardShell>
  );
}
