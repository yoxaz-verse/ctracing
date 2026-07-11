import { createVerificationToken, sendVerificationEmail } from "@/lib/email-verification";
import {
  getVerificationResendAvailableAt,
  getVerificationResendCooldownMessage,
  getVerificationResendRemainingSeconds,
} from "@/lib/email-verification-cooldown";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

type SupabaseClient = Pick<Awaited<ReturnType<typeof createClient>>, "from">;

type VerificationResendParams = {
  supabase: SupabaseClient;
  userId: string;
  email: string;
  fallbackRole: UserRole;
  fallbackCompanyName: string;
};

type VerificationResendResult =
  | {
      ok: true;
      message: string;
      profile: Profile | null;
      alreadyVerified: boolean;
      cooldownAvailableAt: string | null;
    }
  | {
      ok: false;
      message: string;
      profile: Profile | null;
      status: number;
      cooldownAvailableAt: string | null;
      retryAfterSeconds?: number;
    };

const profileSelect =
  "id,email,role,company_name,contact_name,website,country,company_location,incorporated_on,gstin,gst_details,registration_type,registration_number,annual_credit_demand,preferred_project_types,carbon_purchase_goal,annual_credit_supply,project_methodologies,registry_experience,company_verification_status,company_verified_at,company_verified_by,company_verification_note,email_verified_at,onboarding_completed_at";

async function ensureVerificationProfile({
  supabase,
  userId,
  email,
  fallbackRole,
  fallbackCompanyName,
}: VerificationResendParams) {
  const { data: profile, error: readError } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", userId)
    .maybeSingle<Profile>();

  if (readError) {
    return { profile: null, error: readError };
  }

  if (profile) {
    return { profile, error: null };
  }

  const { data: createdProfile, error: upsertError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email,
      role: fallbackRole,
      company_name: fallbackCompanyName || null,
      company_verification_status: "pending",
      email_verified_at: null,
    })
    .select(profileSelect)
    .single<Profile>();

  return { profile: createdProfile ?? null, error: upsertError };
}

export async function getVerificationResendAvailability(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("email_verification_tokens")
    .select("created_at")
    .eq("user_id", userId)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ created_at: string }>();

  if (error) {
    throw error;
  }

  const cooldownAvailableAt = data?.created_at
    ? getVerificationResendAvailableAt(data.created_at)
    : null;

  return {
    cooldownAvailableAt,
    remainingSeconds: getVerificationResendRemainingSeconds(cooldownAvailableAt),
  };
}

export async function requestVerificationEmailResend({
  supabase,
  userId,
  email,
  fallbackRole,
  fallbackCompanyName,
}: VerificationResendParams): Promise<VerificationResendResult> {
  const { profile, error } = await ensureVerificationProfile({
    supabase,
    userId,
    email,
    fallbackRole,
    fallbackCompanyName,
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
      profile,
      status: 400,
      cooldownAvailableAt: null,
    };
  }

  if (profile?.email_verified_at) {
    return {
      ok: true,
      message: "Email is already verified.",
      profile,
      alreadyVerified: true,
      cooldownAvailableAt: null,
    };
  }

  const availability = await getVerificationResendAvailability(supabase, userId);

  if (availability.remainingSeconds > 0) {
    return {
      ok: false,
      message: getVerificationResendCooldownMessage(availability.remainingSeconds),
      profile,
      status: 429,
      cooldownAvailableAt: availability.cooldownAvailableAt,
      retryAfterSeconds: availability.remainingSeconds,
    };
  }

  const token = await createVerificationToken(userId);
  await sendVerificationEmail({
    email: email || profile?.email || "",
    companyName: profile?.company_name ?? fallbackCompanyName,
    token,
  });

  return {
    ok: true,
    message: "Verification email sent from TeraTrace.",
    profile,
    alreadyVerified: false,
    cooldownAvailableAt: getVerificationResendAvailableAt(new Date()),
  };
}
