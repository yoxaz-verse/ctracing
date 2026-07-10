import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Profile, UserRole } from "./types";

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
    .select("id,email,role,company_name,email_verified_at")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const fallbackRole = user.user_metadata?.role as UserRole | undefined;
  const resolvedProfile: Profile = profile ?? {
    id: user.id,
    email: user.email ?? "",
    role: fallbackRole === "seller" ? "seller" : "buyer",
    company_name: (user.user_metadata?.company_name as string | undefined) ?? null,
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
