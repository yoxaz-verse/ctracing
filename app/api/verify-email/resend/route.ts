import { NextResponse } from "next/server";
import { requestVerificationEmailResend } from "@/lib/email-verification-resend";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

type AuthMetadata = {
  role?: unknown;
  company_name?: unknown;
};

function getMetadataRole(metadata: AuthMetadata | null | undefined): UserRole {
  if (metadata?.role === "admin") {
    return "admin";
  }

  return metadata?.role === "seller" ? "seller" : "buyer";
}

function getMetadataCompanyName(metadata: AuthMetadata | null | undefined) {
  return typeof metadata?.company_name === "string"
    ? metadata.company_name.trim()
    : "";
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Could not send verification email.";
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Please log in before requesting verification email." },
      { status: 401 },
    );
  }

  const metadata = user.user_metadata as AuthMetadata | undefined;
  const fallbackRole = getMetadataRole(metadata);
  const fallbackCompanyName = getMetadataCompanyName(metadata);

  try {
    const result = await requestVerificationEmailResend({
      supabase,
      userId: user.id,
      email: user.email ?? "",
      fallbackRole,
      fallbackCompanyName,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          message: result.message,
          cooldownAvailableAt: result.cooldownAvailableAt,
          retryAfterSeconds: result.retryAfterSeconds,
        },
        { status: result.status },
      );
    }

    return NextResponse.json({
      message: result.message,
      cooldownAvailableAt: result.cooldownAvailableAt,
      alreadyVerified: result.alreadyVerified,
    });
  } catch (error) {
    return NextResponse.json({ message: errorMessage(error) }, { status: 400 });
  }
}
