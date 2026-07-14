"use server";

import { redirect } from "next/navigation";
import { requestVerificationEmailResend } from "@/lib/email-verification-resend";
import {
  createPasswordResetToken,
  sendPasswordResetEmail,
  updatePasswordWithResetToken,
} from "@/lib/password-reset";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

type AuthMetadata = {
  role?: unknown;
  company_name?: unknown;
};

const profileSelect =
  "id,email,role,company_name,contact_name,website,country,company_location,incorporated_on,gstin,gst_details,registration_type,registration_number,annual_credit_demand,preferred_project_types,carbon_purchase_goal,annual_credit_supply,project_methodologies,registry_experience,company_verification_status,company_verified_at,company_verified_by,company_verification_note,email_verified_at,onboarding_completed_at";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getRole(formData: FormData): UserRole {
  const role = getString(formData, "role");
  return role === "seller" || role === "facilitator" ? role : "buyer";
}

function getMetadataRole(metadata: AuthMetadata | null | undefined): UserRole {
  if (metadata?.role === "admin") {
    return "admin";
  }

  return metadata?.role === "seller" || metadata?.role === "facilitator"
    ? metadata.role
    : "buyer";
}

function getRolePath(role: UserRole) {
  if (role === "admin") {
    return "/dashboard/admin";
  }

  if (role === "facilitator") {
    return "/dashboard/facilitator";
  }

  return role === "seller" ? "/dashboard/seller" : "/dashboard/buyer";
}

function getMetadataCompanyName(metadata: AuthMetadata | null | undefined) {
  return typeof metadata?.company_name === "string"
    ? metadata.company_name.trim()
    : "";
}

function messageFromError(error: unknown, fallback: string) {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      error_description?: unknown;
      error?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };

    for (const key of [
      "message",
      "error_description",
      "error",
      "details",
      "hint",
      "code",
    ] as const) {
      const value = candidate[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }

  return fallback;
}

function redirectWithError(
  path:
    | "/login"
    | "/signup"
    | "/verify-email/pending"
    | "/forgot-password"
    | "/reset-password",
  error: unknown,
): never {
  const message = messageFromError(
    error,
    "Something went wrong. Check your Supabase Auth logs for the reference shown in the server output.",
  );
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function redirectWithErrorAndToken(path: "/reset-password", token: string, error: unknown): never {
  const message = messageFromError(
    error,
    "Something went wrong. Check the server logs and try again.",
  );
  redirect(`${path}?token=${encodeURIComponent(token)}&error=${encodeURIComponent(message)}`);
}

function redirectSupabaseConfirmationEnabled(): never {
  redirectWithError(
    "/signup",
    "Supabase email confirmation is still enabled. Disable it in Supabase Auth email settings so TeraTrace can send verification through SMTP instead of noreply@mail.app.supabase.io.",
  );
}

async function ensureProfile({
  supabase,
  id,
  email,
  role,
  companyName,
}: {
  supabase: Pick<Awaited<ReturnType<typeof createClient>>, "from">;
  id: string;
  email: string;
  role: UserRole;
  companyName: string;
}) {
  const { data: profile, error: readError } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", id)
    .maybeSingle<Profile>();

  if (readError) {
    return { profile: null, role, error: readError };
  }

  if (profile) {
    return {
      profile,
      role: profile.role,
      error: null,
    };
  }

  const { data: createdProfile, error: upsertError } = await supabase
    .from("profiles")
    .upsert({
      id,
      email,
      role,
      company_name: companyName || null,
      company_verification_status: "pending",
      email_verified_at: null,
    })
    .select(profileSelect)
    .single<Profile>();

  return { profile: createdProfile ?? null, role, error: upsertError };
}

export async function signUp(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const confirmPassword = getString(formData, "confirmPassword");
  const companyName = getString(formData, "companyName");
  const role = getRole(formData);

  if (password !== confirmPassword) {
    redirectWithError("/signup", "Passwords do not match.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        company_name: companyName,
      },
    },
  });

  if (error) {
    redirectWithError("/signup", error);
  }

  if (!data.session) {
    redirectSupabaseConfirmationEnabled();
  }

  if (data.user) {
    const { error: profileError } = await ensureProfile({
      supabase,
      id: data.user.id,
      email,
      role,
      companyName,
    });

    if (profileError) {
      redirectWithError("/signup", profileError);
    }

  }

  redirect("/verify-email/pending?send=1");
}

export async function logIn(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectWithError("/login", error);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirectWithError(
      "/login",
      "Login succeeded, but no authenticated Supabase user was returned.",
    );
  }

  const metadata = user.user_metadata as AuthMetadata | undefined;
  const fallbackRole = getMetadataRole(metadata);
  const fallbackCompanyName = getMetadataCompanyName(metadata);

  const { profile, role, error: profileError } = await ensureProfile({
    supabase,
    id: user.id,
    email: user.email ?? email,
    role: fallbackRole,
    companyName: fallbackCompanyName,
  });

  if (profileError) {
    redirectWithError("/login", profileError);
  }

  if (!profile?.email_verified_at) {
    redirect("/verify-email/pending");
  }

  redirect(getRolePath(role));
}

export async function requestPasswordReset(formData: FormData) {
  const email = getString(formData, "email");

  if (!email) {
    redirectWithError("/forgot-password", "Enter your account email address.");
  }

  try {
    const reset = await createPasswordResetToken(email);

    if (reset) {
      await sendPasswordResetEmail(reset);
    }
  } catch (error) {
    redirectWithError("/forgot-password", error);
  }

  redirect("/forgot-password?sent=1");
}

export async function resetPassword(formData: FormData) {
  const token = getString(formData, "token");
  const password = getString(formData, "password");
  const confirmPassword = getString(formData, "confirmPassword");

  if (password !== confirmPassword) {
    redirectWithErrorAndToken("/reset-password", token, "Passwords do not match.");
  }

  const result = await updatePasswordWithResetToken({ token, password });

  if (!result.ok) {
    redirectWithErrorAndToken("/reset-password", token, result.message);
  }

  redirect(`/login?message=${encodeURIComponent(result.message)}`);
}

export async function resendVerificationEmail() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const metadata = user.user_metadata as AuthMetadata | undefined;
  const fallbackRole = getMetadataRole(metadata);
  const fallbackCompanyName = getMetadataCompanyName(metadata);

  const { profile, error } = await ensureProfile({
    supabase,
    id: user.id,
    email: user.email ?? "",
    role: fallbackRole,
    companyName: fallbackCompanyName,
  });

  if (error) {
    redirectWithError("/verify-email/pending", error);
  }

  if (profile?.email_verified_at) {
    redirect(getRolePath(profile.role));
  }

  let resendResult: Awaited<ReturnType<typeof requestVerificationEmailResend>>;

  try {
    resendResult = await requestVerificationEmailResend({
      supabase,
      userId: user.id,
      email: user.email ?? profile?.email ?? "",
      fallbackRole,
      fallbackCompanyName,
    });
  } catch (sendError) {
    redirectWithError("/verify-email/pending", sendError);
  }

  if (!resendResult.ok) {
    redirectWithError("/verify-email/pending", resendResult.message);
  }

  redirect("/verify-email/pending?sent=1");
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
