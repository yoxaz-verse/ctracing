import { NextResponse } from "next/server";
import {
  createVerificationToken,
  sendVerificationEmail,
} from "@/lib/email-verification";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

type AuthMetadata = {
  role?: unknown;
  company_name?: unknown;
};

function getMetadataRole(metadata: AuthMetadata | null | undefined): UserRole {
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

  const { data: profile, error: profileReadError } = await supabase
    .from("profiles")
    .select("id,email,role,company_name,email_verified_at")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (profileReadError) {
    return NextResponse.json(
      { message: profileReadError.message },
      { status: 400 },
    );
  }

  if (profile?.email_verified_at) {
    return NextResponse.json({ message: "Email is already verified." });
  }

  if (!profile) {
    const { error: profileInsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? "",
      role: fallbackRole,
      company_name: fallbackCompanyName || null,
      email_verified_at: null,
    });

    if (profileInsertError) {
      return NextResponse.json(
        { message: profileInsertError.message },
        { status: 400 },
      );
    }
  }

  try {
    const token = await createVerificationToken(user.id);
    await sendVerificationEmail({
      email: user.email ?? profile?.email ?? "",
      companyName: profile?.company_name ?? fallbackCompanyName,
      token,
    });

    return NextResponse.json({
      message: "Verification email sent from TeraTrace.",
    });
  } catch (error) {
    return NextResponse.json({ message: errorMessage(error) }, { status: 400 });
  }
}
