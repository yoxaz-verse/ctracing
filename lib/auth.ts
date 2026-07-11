import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Profile, UserRole } from "./types";

const profileSelect =
  "id,email,role,company_name,contact_name,website,country,company_location,incorporated_on,gstin,gst_details,registration_type,registration_number,annual_credit_demand,preferred_project_types,carbon_purchase_goal,annual_credit_supply,project_methodologies,registry_experience,company_verification_status,company_verified_at,company_verified_by,company_verification_note,email_verified_at,onboarding_completed_at";

export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const fallbackRole = user.user_metadata?.role as UserRole | undefined;
  const resolvedProfile: Profile = profile ?? {
    id: user.id,
    email: user.email ?? "",
    role: fallbackRole === "seller" ? "seller" : "buyer",
    company_name: (user.user_metadata?.company_name as string | undefined) ?? null,
    company_verification_status: "pending",
    email_verified_at: null,
  };

  if (!resolvedProfile.email_verified_at) {
    redirect("/verify-email/pending");
  }

  return { supabase, user, profile: resolvedProfile };
}

export function redirectForRole(role: UserRole) {
  if (role === "admin") {
    redirect("/dashboard/admin");
  }

  redirect(role === "seller" ? "/dashboard/seller" : "/dashboard/buyer");
}
