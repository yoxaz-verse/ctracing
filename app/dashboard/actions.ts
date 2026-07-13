"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import { ESTIMATE_DISCLAIMER } from "@/lib/estimator/config";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getRequiredString(formData: FormData, key: string) {
  const value = getString(formData, key);

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function getPositiveNumber(formData: FormData, key: string) {
  const value = Number(getString(formData, key));

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${key} must be greater than zero.`);
  }

  return value;
}

function cleanLifecycleStatus(value: string) {
  return [
    "draft",
    "submitted",
    "needs_review",
    "listed",
    "paused",
    "archived",
  ].includes(value)
    ? value
    : "draft";
}

function cleanInterestStatus(value: string) {
  return [
    "submitted",
    "seller_review",
    "more_info_requested",
    "qualified",
    "closed",
  ].includes(value)
    ? value
    : "seller_review";
}

function cleanCompanyVerificationStatus(value: string) {
  return ["pending", "verified", "needs_update"].includes(value)
    ? value
    : "pending";
}

function getOptionalNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getOptionalDate(formData: FormData, key: string) {
  const value = getString(formData, key);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function getRedirectPath(formData: FormData, fallback: string) {
  const value = getString(formData, "redirectTo");
  return value.startsWith("/dashboard/") ? value : fallback;
}

function getJsonObject(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) {
    throw new Error(`${key} is required.`);
  }

  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${key} must be a JSON object.`);
  }

  return parsed as Record<string, unknown>;
}

function asFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function cleanFactorUpdate(value: number, min = 0, max = Number.POSITIVE_INFINITY) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function formDataHas(formData: FormData, key: string) {
  return formData.has(key);
}

async function recordAudit(
  supabase: Awaited<ReturnType<typeof getSessionProfile>>["supabase"],
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {},
) {
  await supabase.rpc("record_audit", {
    action_input: action,
    entity_type_input: entityType,
    entity_id_input: entityId,
    metadata_input: metadata,
  });
}

async function notifyUser(
  supabase: Awaited<ReturnType<typeof getSessionProfile>>["supabase"],
  userId: string,
  title: string,
  body: string,
  href: string,
) {
  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    body,
    href,
  });
}

export async function createProject(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const redirectTo = getRedirectPath(formData, "/dashboard/seller/projects");
  const { data, error } = await supabase
    .from("carbon_projects")
    .insert({
    seller_id: profile.id,
    project_name: getRequiredString(formData, "projectName"),
    location: getRequiredString(formData, "location"),
    methodology: getRequiredString(formData, "methodology"),
    available_credits: Math.round(getPositiveNumber(formData, "availableCredits")),
    price_per_credit: getPositiveNumber(formData, "pricePerCredit"),
    verification_status: "Documentation review",
    lifecycle_status: "draft",
    project_description: getString(formData, "projectDescription") || null,
    estimated_annual_credits: getOptionalNumber(formData, "estimatedAnnualCredits"),
    vintage_year: getOptionalNumber(formData, "vintageYear"),
    registry_name: getString(formData, "registryName") || null,
    documentation_score: Math.min(
      100,
      Math.max(0, Math.round(getOptionalNumber(formData, "documentationScore") ?? 0)),
    ),
  })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "project.created", "carbon_project", data?.id ?? null, {
    project_name: getString(formData, "projectName"),
  });

  revalidatePath("/dashboard/seller");
  revalidatePath("/dashboard/seller/projects");
  revalidatePath("/dashboard/buyer");
  revalidatePath("/dashboard/buyer/projects");
  revalidatePath("/dashboard/admin/reviews");
  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function saveProjectEstimate(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  const inputData = getJsonObject(formData, "inputDataJson");
  const resultData = getJsonObject(formData, "resultDataJson");
  const redirectTo = getRedirectPath(formData, "/dashboard/estimator");
  const missingEvidence = Array.isArray(resultData.missingEvidence)
    ? resultData.missingEvidence.filter((item): item is string => typeof item === "string")
    : [];

  const { data, error } = await supabase
    .from("project_estimates")
    .insert({
      user_id: profile.id,
      project_type: String(resultData.projectType ?? inputData.projectType ?? "Unknown"),
      registry_pathway: String(
        resultData.registryPathway ?? inputData.registryPathway ?? "Not sure",
      ),
      methodology_reference: String(resultData.methodologyReference ?? ""),
      country: typeof inputData.country === "string" ? inputData.country : null,
      state: typeof inputData.state === "string" ? inputData.state : null,
      location: typeof inputData.location === "string" ? inputData.location : null,
      input_data_json: inputData,
      assumptions_json: resultData,
      gross_impact_tco2e: asFiniteNumber(resultData.grossImpactTco2e),
      baseline_deduction_tco2e: asFiniteNumber(resultData.baselineDeductionTco2e),
      leakage_deduction_tco2e: asFiniteNumber(resultData.leakageDeductionTco2e),
      uncertainty_deduction_tco2e: asFiniteNumber(resultData.uncertaintyDeductionTco2e),
      buffer_deduction_tco2e: asFiniteNumber(resultData.bufferDeductionTco2e),
      project_emissions_tco2e: asFiniteNumber(resultData.projectEmissionsTco2e),
      net_estimated_credits: asFiniteNumber(resultData.netEstimatedCredits),
      estimated_plastic_credits: asFiniteNumber(resultData.estimatedPlasticCredits),
      estimated_co2e_benefit: asFiniteNumber(resultData.estimatedCo2eBenefitKg),
      estimated_value: asFiniteNumber(resultData.estimatedValue),
      readiness_score: Math.round(asFiniteNumber(resultData.readinessScore)),
      confidence_level: String(resultData.confidenceLevel ?? "Low confidence"),
      missing_evidence_json: missingEvidence,
      disclaimer_text: String(resultData.disclaimerText ?? ESTIMATE_DISCLAIMER),
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "project_estimate.saved", "project_estimate", data?.id ?? null, {
    project_type: resultData.projectType,
  });

  revalidatePath("/dashboard/estimator");
  redirect(`${redirectTo}?savedEstimateId=${encodeURIComponent(data?.id ?? "")}`);
}

export async function updateEmissionFactor(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile.role !== "admin") {
    redirectForRole(profile.role);
  }

  const factorId = getRequiredString(formData, "factorId");
  const value = cleanFactorUpdate(getPositiveNumber(formData, "value"));
  const defaultLow = getOptionalNumber(formData, "defaultLow");
  const defaultMedium = getOptionalNumber(formData, "defaultMedium");
  const defaultHigh = getOptionalNumber(formData, "defaultHigh");
  const redirectTo = getRedirectPath(formData, "/dashboard/admin/factors");
  const { error } = await supabase
    .from("emission_factors")
    .update({
      value,
      default_low: defaultLow === null ? null : cleanFactorUpdate(defaultLow),
      default_medium: defaultMedium === null ? null : cleanFactorUpdate(defaultMedium),
      default_high: defaultHigh === null ? null : cleanFactorUpdate(defaultHigh),
      source_name: getString(formData, "sourceName") || null,
      source_url: getString(formData, "sourceUrl") || null,
      version: getString(formData, "version") || null,
    })
    .eq("id", factorId)
    .eq("is_admin_editable", true);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "emission_factor.updated", "emission_factor", factorId);
  revalidatePath("/dashboard/admin/factors");
  redirect(`${redirectTo}?saved=1`);
}

export async function updateCompanyProfile(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "buyer" && profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const redirectTo = getRedirectPath(
    formData,
    profile.role === "seller"
      ? "/dashboard/seller/profile"
      : "/dashboard/buyer/profile",
  );
  const companyName = getRequiredString(formData, "companyName");
  const companyLocation = getRequiredString(formData, "companyLocation");
  const contactName = getRequiredString(formData, "contactName");
  const country = getRequiredString(formData, "country");
  const registrationType = getString(formData, "registrationType");
  const legalUpdate: Record<string, string | number | null> = {
    company_name: companyName,
    company_location: companyLocation,
    contact_name: contactName,
    country,
    website: getString(formData, "website") || null,
    incorporated_on: getOptionalDate(formData, "incorporatedOn"),
    gstin: getString(formData, "gstin") || null,
    gst_details: getString(formData, "gstDetails") || null,
    registration_type: ["cin", "ngo", "other"].includes(registrationType)
      ? registrationType
      : null,
    registration_number: getString(formData, "registrationNumber") || null,
    onboarding_completed_at: new Date().toISOString(),
  };

  const roleUpdate =
    profile.role === "buyer"
      ? {
          annual_credit_demand: getOptionalNumber(
            formData,
            "annualCreditDemand",
          ),
          preferred_project_types:
            getString(formData, "preferredProjectTypes") || null,
          carbon_purchase_goal:
            getString(formData, "carbonPurchaseGoal") || null,
        }
      : {
          annual_credit_supply: getOptionalNumber(
            formData,
            "annualCreditSupply",
          ),
          project_methodologies:
            getString(formData, "projectMethodologies") || null,
          registry_experience:
            getString(formData, "registryExperience") || null,
        };

  const { data: currentProfile, error: readError } = await supabase
    .from("profiles")
    .select(
      "company_name,company_location,contact_name,country,website,incorporated_on,gstin,gst_details,registration_type,registration_number,company_verification_status",
    )
    .eq("id", profile.id)
    .maybeSingle<Record<string, string | null>>();

  if (readError) {
    redirect(`${redirectTo}?error=${encodeURIComponent(readError.message)}`);
  }

  const changedLegalFields = Object.entries(legalUpdate).some(([key, value]) => {
    if (key === "onboarding_completed_at") {
      return false;
    }

    return (currentProfile?.[key] ?? null) !== value;
  });
  const shouldResetVerification =
    currentProfile?.company_verification_status === "verified" &&
    changedLegalFields;
  const update = {
    ...legalUpdate,
    ...roleUpdate,
    ...(shouldResetVerification
      ? {
          company_verification_status: "pending",
          company_verified_at: null,
          company_verified_by: null,
        }
      : {}),
  };

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", profile.id);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "profile.updated", "profile", profile.id, {
    role: profile.role,
    company_verification_reset: shouldResetVerification,
  });

  revalidatePath("/dashboard/buyer");
  revalidatePath("/dashboard/buyer/profile");
  revalidatePath("/dashboard/seller");
  revalidatePath("/dashboard/seller/profile");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
  revalidatePath(redirectTo);
  redirect(`${redirectTo}?saved=1`);
}

export async function updateProject(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const projectId = getRequiredString(formData, "projectId");
  const redirectTo = getRedirectPath(formData, "/dashboard/seller/projects");
  const update: Record<string, string | number | null> = {
    project_name: getRequiredString(formData, "projectName"),
    location: getRequiredString(formData, "location"),
    methodology: getRequiredString(formData, "methodology"),
    available_credits: Math.round(
      getPositiveNumber(formData, "availableCredits"),
    ),
    price_per_credit: getPositiveNumber(formData, "pricePerCredit"),
  };

  if (formDataHas(formData, "projectDescription")) {
    update.project_description = getString(formData, "projectDescription") || null;
  }
  if (formDataHas(formData, "estimatedAnnualCredits")) {
    update.estimated_annual_credits = getOptionalNumber(
      formData,
      "estimatedAnnualCredits",
    );
  }
  if (formDataHas(formData, "vintageYear")) {
    update.vintage_year = getOptionalNumber(formData, "vintageYear");
  }
  if (formDataHas(formData, "registryName")) {
    update.registry_name = getString(formData, "registryName") || null;
  }
  if (formDataHas(formData, "documentationScore")) {
    update.documentation_score = Math.min(
      100,
      Math.max(0, Math.round(getOptionalNumber(formData, "documentationScore") ?? 0)),
    );
  }

  const { error } = await supabase
    .from("carbon_projects")
    .update(update)
    .eq("id", projectId)
    .eq("seller_id", profile.id);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "project.updated", "carbon_project", projectId);

  revalidatePath("/dashboard/seller");
  revalidatePath("/dashboard/seller/projects");
  revalidatePath("/dashboard/buyer");
  revalidatePath("/dashboard/buyer/projects");
  revalidatePath("/dashboard/admin/reviews");
  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function deleteProject(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const projectId = getRequiredString(formData, "projectId");
  const redirectTo = getRedirectPath(formData, "/dashboard/seller/projects");
  const { error } = await supabase
    .from("carbon_projects")
    .delete()
    .eq("id", projectId)
    .eq("seller_id", profile.id);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "project.deleted", "carbon_project", projectId);

  revalidatePath("/dashboard/seller");
  revalidatePath("/dashboard/seller/projects");
  revalidatePath("/dashboard/buyer");
  revalidatePath("/dashboard/buyer/projects");
  revalidatePath("/dashboard/admin/reviews");
  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function registerInterest(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "buyer") {
    redirectForRole(profile.role);
  }

  const projectId = getRequiredString(formData, "projectId");
  const redirectTo = getRedirectPath(formData, "/dashboard/buyer/projects");
  const requestedCredits = Math.round(
    getPositiveNumber(formData, "requestedCredits"),
  );
  const buyerNote = getString(formData, "buyerNote");

  const { data: existingInterest, error: readError } = await supabase
    .from("buyer_interests")
    .select("id")
    .eq("buyer_id", profile.id)
    .eq("project_id", projectId)
    .maybeSingle<{ id: string }>();

  if (readError) {
    redirect(`${redirectTo}?error=${encodeURIComponent(readError.message)}`);
  }

  const result = existingInterest
    ? await supabase
        .from("buyer_interests")
        .update({
          requested_credits: requestedCredits,
          status: "submitted",
          buyer_note: buyerNote || null,
          updated_by: profile.id,
        })
        .eq("id", existingInterest.id)
        .eq("buyer_id", profile.id)
    : await supabase.from("buyer_interests").insert({
        buyer_id: profile.id,
        project_id: projectId,
        requested_credits: requestedCredits,
        status: "submitted",
        buyer_note: buyerNote || null,
        updated_by: profile.id,
      });

  if (result.error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(result.error.message)}`);
  }

  await recordAudit(supabase, "interest.submitted", "buyer_interest", null, {
    project_id: projectId,
    requested_credits: requestedCredits,
  });

  revalidatePath("/dashboard/buyer");
  revalidatePath("/dashboard/buyer/interests");
  revalidatePath("/dashboard/buyer/projects");
  revalidatePath("/dashboard/seller");
  revalidatePath("/dashboard/seller/inquiries");
  redirect(redirectTo);
}

export async function saveProject(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile.role !== "buyer") {
    redirectForRole(profile.role);
  }

  const projectId = getRequiredString(formData, "projectId");
  const redirectTo = getRedirectPath(formData, "/dashboard/buyer/projects");
  const { error } = await supabase.from("saved_projects").upsert({
    buyer_id: profile.id,
    project_id: projectId,
  });

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "project.saved", "carbon_project", projectId);
  revalidatePath("/dashboard/buyer/projects");
  redirect(redirectTo);
}

export async function unsaveProject(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile.role !== "buyer") {
    redirectForRole(profile.role);
  }

  const projectId = getRequiredString(formData, "projectId");
  const redirectTo = getRedirectPath(formData, "/dashboard/buyer/projects");
  const { error } = await supabase
    .from("saved_projects")
    .delete()
    .eq("buyer_id", profile.id)
    .eq("project_id", projectId);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "project.unsaved", "carbon_project", projectId);
  revalidatePath("/dashboard/buyer/projects");
  redirect(redirectTo);
}

export async function submitProjectForReview(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const projectId = getRequiredString(formData, "projectId");
  const redirectTo = getRedirectPath(formData, "/dashboard/seller/projects");
  const { error } = await supabase
    .from("carbon_projects")
    .update({ lifecycle_status: "submitted" })
    .eq("id", projectId)
    .eq("seller_id", profile.id)
    .neq("lifecycle_status", "listed");

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "project.submitted_for_review", "carbon_project", projectId);
  revalidatePath("/dashboard/seller");
  revalidatePath("/dashboard/seller/projects");
  revalidatePath("/dashboard/admin/reviews");
  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function addProjectDocument(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const projectId = getRequiredString(formData, "projectId");
  const redirectTo = getRedirectPath(formData, "/dashboard/seller/projects");
  const { error } = await supabase.from("project_documents").insert({
    project_id: projectId,
    uploaded_by: profile.id,
    document_name: getRequiredString(formData, "documentName"),
    document_category: getString(formData, "documentCategory") || "Project documentation",
    document_url: getString(formData, "documentUrl") || null,
  });

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "project_document.added", "carbon_project", projectId);
  revalidatePath("/dashboard/seller/projects");
  revalidatePath("/dashboard/admin/reviews");
  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function adminReviewProject(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile.role !== "admin") {
    redirectForRole(profile.role);
  }

  const projectId = getRequiredString(formData, "projectId");
  const decisionStatus = cleanLifecycleStatus(getRequiredString(formData, "decisionStatus"));
  const reviewNote = getString(formData, "reviewNote");
  const redirectTo = getRedirectPath(formData, "/dashboard/admin/reviews");

  const update = await supabase
    .from("carbon_projects")
    .update({ lifecycle_status: decisionStatus })
    .eq("id", projectId);

  if (update.error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(update.error.message)}`);
  }

  const review = await supabase.from("project_reviews").insert({
    project_id: projectId,
    reviewer_id: profile.id,
    decision_status: decisionStatus === "draft" ? "needs_review" : decisionStatus,
    review_note: reviewNote || null,
  });

  if (review.error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(review.error.message)}`);
  }

  await recordAudit(supabase, "project.reviewed", "carbon_project", projectId, {
    decision_status: decisionStatus,
  });
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/reviews");
  revalidatePath("/dashboard/buyer");
  revalidatePath("/dashboard/buyer/projects");
  redirect(redirectTo);
}

export async function adminReviewCompanyProfile(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile.role !== "admin") {
    redirectForRole(profile.role);
  }

  const userId = getRequiredString(formData, "userId");
  const decisionStatus = cleanCompanyVerificationStatus(
    getRequiredString(formData, "companyVerificationStatus"),
  );
  const reviewNote = getString(formData, "companyVerificationNote");
  const redirectTo = getRedirectPath(formData, "/dashboard/admin/users");
  const now = new Date().toISOString();

  const { data: reviewedProfile, error: readError } = await supabase
    .from("profiles")
    .select("id,email,role,company_name")
    .eq("id", userId)
    .maybeSingle<{
      id: string;
      email: string;
      role: string;
      company_name: string | null;
    }>();

  if (readError) {
    redirect(`${redirectTo}?error=${encodeURIComponent(readError.message)}`);
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      company_verification_status: decisionStatus,
      company_verified_at: decisionStatus === "verified" ? now : null,
      company_verified_by: decisionStatus === "verified" ? profile.id : null,
      company_verification_note: reviewNote || null,
    })
    .eq("id", userId)
    .in("role", ["buyer", "seller"]);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "company_profile.reviewed", "profile", userId, {
    decision_status: decisionStatus,
  });

  if (reviewedProfile) {
    await notifyUser(
      supabase,
      userId,
      decisionStatus === "verified"
        ? "Company profile verified"
        : "Company profile needs review",
      decisionStatus === "verified"
        ? "An admin verified your company profile. Your workspace now shows a verified company badge."
        : reviewNote ||
            "An admin reviewed your company profile and requested updates.",
      reviewedProfile.role === "seller"
        ? "/dashboard/seller/profile"
        : "/dashboard/buyer/profile",
    );
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/buyer");
  revalidatePath("/dashboard/buyer/profile");
  revalidatePath("/dashboard/seller");
  revalidatePath("/dashboard/seller/profile");
  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function respondToInterest(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const interestId = getRequiredString(formData, "interestId");
  const redirectTo = getRedirectPath(formData, "/dashboard/seller/inquiries");
  const { error } = await supabase
    .from("buyer_interests")
    .update({
      status: cleanInterestStatus(getString(formData, "interestStatus")),
      seller_response_note: getString(formData, "sellerResponseNote") || null,
      updated_by: profile.id,
    })
    .eq("id", interestId);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "interest.responded", "buyer_interest", interestId);
  revalidatePath("/dashboard/seller/inquiries");
  revalidatePath("/dashboard/buyer/interests");
  redirect(redirectTo);
}

export async function sendMarketplaceMessage(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  const interestId = getRequiredString(formData, "interestId");
  const redirectTo = getRedirectPath(formData, "/dashboard/buyer/interests");
  const { error } = await supabase.from("marketplace_messages").insert({
    interest_id: interestId,
    sender_id: profile.id,
    message_body: getRequiredString(formData, "messageBody"),
  });

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "message.sent", "buyer_interest", interestId);
  revalidatePath("/dashboard/buyer/interests");
  revalidatePath("/dashboard/seller/inquiries");
  redirect(redirectTo);
}

export async function markNotificationRead(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  const notificationId = getRequiredString(formData, "notificationId");
  const redirectTo = getRedirectPath(formData, "/dashboard");
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", profile.id);

  revalidatePath(redirectTo);
  redirect(redirectTo);
}
