"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile, redirectForRole } from "@/lib/auth";

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

function cleanStatus(value: string) {
  return value || "Documentation review";
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

function getOptionalNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getRedirectPath(formData: FormData, fallback: string) {
  const value = getString(formData, "redirectTo");
  return value.startsWith("/dashboard/") ? value : fallback;
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
    verification_status: cleanStatus(getString(formData, "verificationStatus")),
    lifecycle_status: cleanLifecycleStatus(getString(formData, "lifecycleStatus")),
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
  redirect(redirectTo);
}

export async function updateProject(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const projectId = getRequiredString(formData, "projectId");
  const redirectTo = getRedirectPath(formData, "/dashboard/seller/projects");
  const { error } = await supabase
    .from("carbon_projects")
    .update({
      project_name: getRequiredString(formData, "projectName"),
      location: getRequiredString(formData, "location"),
      methodology: getRequiredString(formData, "methodology"),
      available_credits: Math.round(
        getPositiveNumber(formData, "availableCredits"),
      ),
      price_per_credit: getPositiveNumber(formData, "pricePerCredit"),
      verification_status: cleanStatus(getString(formData, "verificationStatus")),
      lifecycle_status: cleanLifecycleStatus(getString(formData, "lifecycleStatus")),
      project_description: getString(formData, "projectDescription") || null,
      estimated_annual_credits: getOptionalNumber(formData, "estimatedAnnualCredits"),
      vintage_year: getOptionalNumber(formData, "vintageYear"),
      registry_name: getString(formData, "registryName") || null,
      documentation_score: Math.min(
        100,
        Math.max(0, Math.round(getOptionalNumber(formData, "documentationScore") ?? 0)),
      ),
    })
    .eq("id", projectId)
    .eq("seller_id", profile.id);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "project.updated", "carbon_project", projectId);

  revalidatePath("/dashboard/seller");
  revalidatePath("/dashboard/seller/projects");
  revalidatePath("/dashboard/buyer");
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
    .eq("seller_id", profile.id);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  await recordAudit(supabase, "project.submitted_for_review", "carbon_project", projectId);
  revalidatePath("/dashboard/seller/projects");
  revalidatePath("/dashboard/admin/reviews");
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
  revalidatePath("/dashboard/buyer/projects");
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
