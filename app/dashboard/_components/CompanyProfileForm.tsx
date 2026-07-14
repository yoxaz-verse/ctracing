import { PendingButton } from "@/app/_components/PendingButton";
import { updateCompanyProfile } from "@/app/dashboard/actions";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import type { Profile } from "@/lib/types";

function numberValue(value: number | null | undefined) {
  return value ?? "";
}

export function CompanyProfileForm({
  profile,
  role,
  redirectTo,
}: {
  profile: Profile;
  role: "buyer" | "seller" | "facilitator";
  redirectTo: string;
}) {
  return (
    <form action={updateCompanyProfile} className="grid gap-6">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Company identity</h2>
            <p className="mt-2 text-sm leading-6 text-[#5b6a61]">
              Keep the legal and operating details current for admin review.
            </p>
          </div>
          <StatusBadge status={profile.company_verification_status ?? "pending"} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label>
            <span className="text-sm font-medium text-[#314239]">
              Company name
            </span>
            <input
              required
              name="companyName"
              defaultValue={profile.company_name ?? ""}
              className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
              placeholder="Acme Carbon Pvt Ltd"
            />
          </label>
          <label>
            <span className="text-sm font-medium text-[#314239]">
              Company location
            </span>
            <input
              required
              name="companyLocation"
              defaultValue={profile.company_location ?? ""}
              className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
              placeholder="Bengaluru, Karnataka"
            />
          </label>
          <label>
            <span className="text-sm font-medium text-[#314239]">
              Contact name
            </span>
            <input
              required
              name="contactName"
              defaultValue={profile.contact_name ?? ""}
              className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
              placeholder="Primary account owner"
            />
          </label>
          <label>
            <span className="text-sm font-medium text-[#314239]">Country</span>
            <input
              required
              name="country"
              defaultValue={profile.country ?? ""}
              className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
              placeholder="India"
            />
          </label>
          <label>
            <span className="text-sm font-medium text-[#314239]">Website</span>
            <input
              name="website"
              type="url"
              defaultValue={profile.website ?? ""}
              className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
              placeholder="https://example.com"
            />
          </label>
          <label>
            <span className="text-sm font-medium text-[#314239]">
              Incorporated on
            </span>
            <input
              name="incorporatedOn"
              type="date"
              defaultValue={profile.incorporated_on ?? ""}
              className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
        <h2 className="text-2xl font-semibold">GST and registration</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label>
            <span className="text-sm font-medium text-[#314239]">GSTIN</span>
            <input
              name="gstin"
              defaultValue={profile.gstin ?? ""}
              className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 uppercase outline-none transition focus:border-[#214d35]"
              placeholder="22AAAAA0000A1Z5"
            />
          </label>
          <label>
            <span className="text-sm font-medium text-[#314239]">
              Registration type
            </span>
            <select
              name="registrationType"
              defaultValue={profile.registration_type ?? ""}
              className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
            >
              <option value="">Not provided</option>
              <option value="cin">CIN</option>
              <option value="ngo">NGO</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            <span className="text-sm font-medium text-[#314239]">
              Registration number
            </span>
            <input
              name="registrationNumber"
              defaultValue={profile.registration_number ?? ""}
              className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
              placeholder="CIN, NGO, or other company registration"
            />
          </label>
          <label className="md:col-span-2">
            <span className="text-sm font-medium text-[#314239]">
              GST details
            </span>
            <textarea
              name="gstDetails"
              rows={3}
              defaultValue={profile.gst_details ?? ""}
              className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
              placeholder="Optional notes about GST registration, exemptions, or billing entity."
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
        <h2 className="text-2xl font-semibold">
          {role === "buyer"
            ? "Buyer carbon details"
            : role === "seller"
              ? "Seller carbon details"
              : "Facilitator focus"}
        </h2>
        {role === "buyer" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-sm font-medium text-[#314239]">
                Annual credit demand
              </span>
              <input
                min="0"
                type="number"
                name="annualCreditDemand"
                defaultValue={numberValue(profile.annual_credit_demand)}
                className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                placeholder="10000"
              />
            </label>
            <label>
              <span className="text-sm font-medium text-[#314239]">
                Preferred project types
              </span>
              <input
                name="preferredProjectTypes"
                defaultValue={profile.preferred_project_types ?? ""}
                className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                placeholder="ARR, cookstoves, renewable energy"
              />
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-medium text-[#314239]">
                Carbon purchase goal
              </span>
              <textarea
                name="carbonPurchaseGoal"
                rows={4}
                defaultValue={profile.carbon_purchase_goal ?? ""}
                className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                placeholder="Describe the intended offset, compliance, or procurement goal."
              />
            </label>
          </div>
        ) : role === "seller" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-sm font-medium text-[#314239]">
                Annual credit supply
              </span>
              <input
                min="0"
                type="number"
                name="annualCreditSupply"
                defaultValue={numberValue(profile.annual_credit_supply)}
                className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                placeholder="25000"
              />
            </label>
            <label>
              <span className="text-sm font-medium text-[#314239]">
                Project methodologies
              </span>
              <input
                name="projectMethodologies"
                defaultValue={profile.project_methodologies ?? ""}
                className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                placeholder="ARR, REDD+, biochar"
              />
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-medium text-[#314239]">
                Registry experience
              </span>
              <textarea
                name="registryExperience"
                rows={4}
                defaultValue={profile.registry_experience ?? ""}
                className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                placeholder="Summarize registry experience, prior issuances, or validation stage."
              />
            </label>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-sm font-medium text-[#314239]">
                Annual match volume target
              </span>
              <input
                min="0"
                type="number"
                name="annualCreditDemand"
                defaultValue={numberValue(profile.annual_credit_demand)}
                className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                placeholder="50000"
              />
            </label>
            <label>
              <span className="text-sm font-medium text-[#314239]">
                Focus project types
              </span>
              <input
                name="preferredProjectTypes"
                defaultValue={profile.preferred_project_types ?? ""}
                className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                placeholder="ARR, cookstoves, renewable energy"
              />
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-medium text-[#314239]">
                Matchmaking approach
              </span>
              <textarea
                name="carbonPurchaseGoal"
                rows={4}
                defaultValue={profile.carbon_purchase_goal ?? ""}
                className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                placeholder="Describe the buyer-seller segments, regions, or credibility signals you focus on."
              />
            </label>
          </div>
        )}
      </section>

      {profile.company_verification_note ? (
        <section className="rounded-3xl bg-[#fff7df] p-5 text-sm leading-6 text-[#6c520f] ring-1 ring-[#ead28a]">
          <span className="font-semibold">Admin note: </span>
          {profile.company_verification_note}
        </section>
      ) : null}

      <div className="flex justify-end">
        <PendingButton
          idleLabel="Save company profile"
          pendingLabel="Saving profile..."
          className="rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
        />
      </div>
    </form>
  );
}
