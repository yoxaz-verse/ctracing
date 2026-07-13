import type { CarbonProject } from "@/lib/types";

export function SellerProjectFields({
  project,
  redirectTo,
  initialValues,
}: {
  project?: CarbonProject;
  redirectTo: string;
  initialValues?: Partial<
    Pick<
      CarbonProject,
      | "project_name"
      | "location"
      | "methodology"
      | "available_credits"
      | "price_per_credit"
      | "project_description"
      | "estimated_annual_credits"
      | "registry_name"
      | "documentation_score"
    >
  >;
}) {
  const values = project ?? initialValues;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {project ? <input type="hidden" name="projectId" value={project.id} /> : null}
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <label className="md:col-span-2">
        <span className="text-sm font-medium text-[#314239]">Project name</span>
        <input
          required
          name="projectName"
          defaultValue={values?.project_name}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
          placeholder="Western Ghats Afforestation Corridor"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[#314239]">Location</span>
        <input
          required
          name="location"
          defaultValue={values?.location}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
          placeholder="Karnataka, India"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[#314239]">Methodology</span>
        <input
          required
          name="methodology"
          defaultValue={values?.methodology}
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
          defaultValue={values?.project_description ?? ""}
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
          defaultValue={values?.available_credits}
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
          defaultValue={values?.estimated_annual_credits ?? ""}
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
          defaultValue={values?.price_per_credit}
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
          defaultValue={values?.registry_name ?? ""}
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
          defaultValue={values?.documentation_score ?? 0}
          className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
        />
      </label>
    </div>
  );
}
