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

export async function createProject(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const { error } = await supabase.from("carbon_projects").insert({
    seller_id: profile.id,
    project_name: getRequiredString(formData, "projectName"),
    location: getRequiredString(formData, "location"),
    methodology: getRequiredString(formData, "methodology"),
    available_credits: Math.round(getPositiveNumber(formData, "availableCredits")),
    price_per_credit: getPositiveNumber(formData, "pricePerCredit"),
    verification_status: cleanStatus(getString(formData, "verificationStatus")),
  });

  if (error) {
    redirect(`/dashboard/seller?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/seller");
  revalidatePath("/dashboard/buyer");
}

export async function updateProject(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const projectId = getRequiredString(formData, "projectId");
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
    })
    .eq("id", projectId)
    .eq("seller_id", profile.id);

  if (error) {
    redirect(`/dashboard/seller?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/seller");
  revalidatePath("/dashboard/buyer");
}

export async function deleteProject(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "seller") {
    redirectForRole(profile.role);
  }

  const projectId = getRequiredString(formData, "projectId");
  const { error } = await supabase
    .from("carbon_projects")
    .delete()
    .eq("id", projectId)
    .eq("seller_id", profile.id);

  if (error) {
    redirect(`/dashboard/seller?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/seller");
  revalidatePath("/dashboard/buyer");
}

export async function registerInterest(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "buyer") {
    redirectForRole(profile.role);
  }

  const projectId = getRequiredString(formData, "projectId");
  const requestedCredits = Math.round(
    getPositiveNumber(formData, "requestedCredits"),
  );

  const { data: existingInterest, error: readError } = await supabase
    .from("buyer_interests")
    .select("id")
    .eq("buyer_id", profile.id)
    .eq("project_id", projectId)
    .maybeSingle<{ id: string }>();

  if (readError) {
    redirect(`/dashboard/buyer?error=${encodeURIComponent(readError.message)}`);
  }

  const result = existingInterest
    ? await supabase
        .from("buyer_interests")
        .update({
          requested_credits: requestedCredits,
          status: "Reviewing project documentation",
        })
        .eq("id", existingInterest.id)
        .eq("buyer_id", profile.id)
    : await supabase.from("buyer_interests").insert({
        buyer_id: profile.id,
        project_id: projectId,
        requested_credits: requestedCredits,
        status: "Reviewing project documentation",
      });

  if (result.error) {
    redirect(`/dashboard/buyer?error=${encodeURIComponent(result.error.message)}`);
  }

  revalidatePath("/dashboard/buyer");
  revalidatePath("/dashboard/seller");
}
