import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { createClient } from "./supabase/server";

const TOKEN_BYTES = 32;
const TOKEN_TTL_HOURS = 24;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for SMTP email verification.`);
  }

  return value;
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getAppUrl() {
  return getRequiredEnv("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
}

export function getVerificationLink(token: string) {
  return `${getAppUrl()}/verify-email?token=${encodeURIComponent(token)}`;
}

export async function createVerificationToken(userId: string) {
  const supabase = await createClient();
  const token = crypto.randomBytes(TOKEN_BYTES).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000,
  ).toISOString();

  const { error: consumeError } = await supabase
    .from("email_verification_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("used_at", null);

  if (consumeError) {
    throw consumeError;
  }

  const { error } = await supabase.from("email_verification_tokens").insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (error) {
    throw error;
  }

  return token;
}

export async function sendVerificationEmail({
  email,
  companyName,
  token,
}: {
  email: string;
  companyName?: string | null;
  token: string;
}) {
  const smtpPort = Number(getRequiredEnv("SMTP_PORT"));
  const from = getRequiredEnv("SMTP_FROM");
  const smtpUser = getRequiredEnv("SMTP_USER");
  const link = getVerificationLink(token);

  const transporter = nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: getRequiredEnv("SMTP_PASS"),
    },
  });

  const greeting = companyName ? `Hello ${companyName},` : "Hello,";

  await transporter.sendMail({
    from,
    sender: smtpUser,
    replyTo: smtpUser,
    envelope: {
      from: smtpUser,
      to: email,
    },
    to: email,
    subject: "TeraTrace email verification",
    headers: {
      "X-Auto-Response-Suppress": "OOF, AutoReply",
      "X-TeraTrace-Email-Type": "account-verification",
    },
    text: `${greeting}

You recently created a TeraTrace account. Confirm your email address by opening this verification link:

${link}

This verification link expires in ${TOKEN_TTL_HOURS} hours.

If you did not create a TeraTrace account, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #17201b; line-height: 1.6; max-width: 560px;">
        <h1 style="color: #214d35; font-size: 24px; margin-bottom: 16px;">TeraTrace email verification</h1>
        <p>${greeting}</p>
        <p>You recently created a TeraTrace account. Confirm your email address to unlock your carbon credit workspace.</p>
        <p>
          Verification link:<br />
          <a href="${link}" style="color: #214d35; word-break: break-all;">${link}</a>
        </p>
        <p style="color: #5b6a61;">This link expires in ${TOKEN_TTL_HOURS} hours.</p>
        <p style="color: #5b6a61;">If you did not create a TeraTrace account, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function verifyEmailToken(token: string) {
  if (!token) {
    return { ok: false, message: "Verification token is missing." };
  }

  const supabase = await createClient();
  const tokenHash = hashToken(token);

  const { data, error } = await supabase.rpc("verify_teratrace_email", {
    token_hash_input: tokenHash,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  const result = Array.isArray(data) ? data[0] : data;
  const ok = Boolean(result?.ok);
  const message =
    typeof result?.message === "string"
      ? result.message
      : ok
        ? "Your email is verified. You can log in now."
        : "This verification link could not be verified.";

  return { ok, message };
}
