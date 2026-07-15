import Link from "next/link";
import { redirect } from "next/navigation";
import { resendVerificationEmail } from "@/app/auth/actions";
import { AutoSendVerificationEmail } from "./AutoSendVerificationEmail";
import { ResendVerificationEmailButton } from "./ResendVerificationEmailButton";
import { createClient } from "@/lib/supabase/server";
import { getVerificationResendAvailability } from "@/lib/email-verification-resend";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import type { Profile, UserRole } from "@/lib/types";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Check Email for TeraTrace Verification",
  description:
    "Check your company inbox or resend a verification link for a TeraTrace carbon credit marketplace account.",
  path: "/verify-email/pending",
});

const profileSelect =
  "id,email,role,company_name,contact_name,website,country,company_location,incorporated_on,gstin,gst_details,registration_type,registration_number,annual_credit_demand,preferred_project_types,carbon_purchase_goal,annual_credit_supply,project_methodologies,registry_experience,company_verification_status,company_verified_at,company_verified_by,company_verification_note,email_verified_at,onboarding_completed_at";

export default async function VerificationPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; send?: string; sent?: string }>;
}) {
  const params = await searchParams;
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
  const role =
    profile?.role ??
    (fallbackRole === "seller" || fallbackRole === "facilitator"
      ? fallbackRole
      : "buyer");

  if (profile?.email_verified_at) {
    redirect(
      role === "admin"
        ? "/dashboard/admin"
        : role === "facilitator"
          ? "/dashboard/facilitator"
          : role === "seller"
            ? "/dashboard/seller"
            : "/dashboard/buyer",
    );
  }

  let initialResendAvailableAt: string | null = null;

  try {
    const availability = await getVerificationResendAvailability(supabase, user.id);
    initialResendAvailableAt = availability.cooldownAvailableAt;
  } catch {
    initialResendAvailableAt = null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef3ec] px-6 py-12">
      <ThemeToggle className="fixed right-6 top-6 z-50" />
      <section className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-[#d8ded2]">
        <Link href="/" className="text-lg font-semibold text-[#214d35]">
          TeraTrace
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Verify your email
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Check your company inbox.
        </h1>
        <p className="mt-4 leading-7 text-[#5b6a61]">
          TeraTrace sent a verification link to{" "}
          <span className="font-semibold text-[#17201b]">
            {user.email ?? profile?.email}
          </span>
          . You can open your dashboard after that link is verified.
        </p>

        <AutoSendVerificationEmail shouldSend={params.send === "1"} />

        {params.sent ? (
          <p className="mt-5 rounded-2xl bg-[#eef6ed] px-4 py-3 text-sm text-[#214d35]">
            Verification email sent from TeraTrace.
          </p>
        ) : null}

        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}

        <form action={resendVerificationEmail} className="mt-6">
          <ResendVerificationEmailButton
            initialAvailableAt={initialResendAvailableAt}
            className="w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183b28]"
          />
        </form>

        <p className="mt-5 text-sm leading-6 text-[#6a756d]">
          If you still receive Supabase confirmation emails, disable Supabase
          email confirmation in Auth Providers. This app now sends its own SMTP
          verification email.
        </p>
      </section>
    </main>
  );
}
