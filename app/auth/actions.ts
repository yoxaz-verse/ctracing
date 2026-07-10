"use server";

import { redirect } from "next/navigation";
import { createVerificationToken, sendVerificationEmail } from "@/lib/email-verification";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

type AuthMetadata = {
  role?: unknown;
  company_name?: unknown;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getRole(formData: FormData): UserRole {
  return getString(formData, "role") === "seller" ? "seller" : "buyer";
}

function getMetadataRole(metadata: AuthMetadata | null | undefined): UserRole {
  if (metadata?.role === "admin") {
    return "admin";
  }

  return metadata?.role === "seller" ? "seller" : "buyer";
}

function getRolePath(role: UserRole) {
  if (role === "admin") {
    return "/dashboard/admin";
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
  path: "/login" | "/signup" | "/verify-email/pending",
  error: unknown,
): never {
  const message = messageFromError(
    error,
    "Something went wrong. Check your Supabase Auth logs for the reference shown in the server output.",
  );
  redirect(`${path}?error=${encodeURIComponent(message)}`);
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
    .select("id,email,role,company_name,email_verified_at")
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
      email_verified_at: null,
    })
    .select("id,email,role,company_name,email_verified_at")
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

  try {
    const token = await createVerificationToken(user.id);
    await sendVerificationEmail({
      email: user.email ?? profile?.email ?? "",
      companyName: profile?.company_name ?? fallbackCompanyName,
      token,
    });
  } catch (sendError) {
    redirectWithError("/verify-email/pending", sendError);
  }

  redirect("/verify-email/pending?sent=1");
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
