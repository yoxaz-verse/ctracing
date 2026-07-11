import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { createAdminClient } from "./supabase/admin";

const TOKEN_BYTES = 32;
const TOKEN_TTL_MINUTES = 30;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for password reset email.`);
  }

  return value;
}

function getAppUrl() {
  return getRequiredEnv("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getResetLink(token: string) {
  return `${getAppUrl()}/reset-password?token=${encodeURIComponent(token)}`;
}

function validatePassword(password: string) {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }

  if (!/\d/.test(password)) {
    return "Password must include at least one number.";
  }

  return null;
}

export async function createPasswordResetToken(email: string) {
  const admin = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id,email,company_name")
    .ilike("email", normalizedEmail)
    .limit(1)
    .maybeSingle<{
      id: string;
      email: string;
      company_name: string | null;
    }>();

  if (profileError || !profile) {
    return null;
  }

  const now = new Date().toISOString();
  const token = crypto.randomBytes(TOKEN_BYTES).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + TOKEN_TTL_MINUTES * 60 * 1000,
  ).toISOString();

  const { error: consumeError } = await admin
    .from("password_reset_tokens")
    .update({ used_at: now })
    .eq("user_id", profile.id)
    .is("used_at", null);

  if (consumeError) {
    throw consumeError;
  }

  const { error: insertError } = await admin.from("password_reset_tokens").insert({
    user_id: profile.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (insertError) {
    throw insertError;
  }

  return {
    token,
    email: profile.email,
    companyName: profile.company_name,
  };
}

export async function sendPasswordResetEmail({
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
  const link = getResetLink(token);
  const greeting = companyName ? `Hello ${companyName},` : "Hello,";

  const transporter = nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: getRequiredEnv("SMTP_PASS"),
    },
  });

  await transporter.sendMail({
    from,
    sender: smtpUser,
    replyTo: smtpUser,
    envelope: {
      from: smtpUser,
      to: email,
    },
    to: email,
    subject: "Reset your TeraTrace password",
    headers: {
      "X-Auto-Response-Suppress": "OOF, AutoReply",
      "X-TeraTrace-Email-Type": "password-reset",
    },
    text: `${greeting}

We received a request to reset your TeraTrace password. Open this link to choose a new password:

${link}

This password reset link expires in ${TOKEN_TTL_MINUTES} minutes.

If you did not request this password reset, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #17201b; line-height: 1.6; max-width: 560px;">
        <h1 style="color: #214d35; font-size: 24px; margin-bottom: 16px;">Reset your TeraTrace password</h1>
        <p>${greeting}</p>
        <p>We received a request to reset your TeraTrace password. Open the link below to choose a new password.</p>
        <p>
          Reset link:<br />
          <a href="${link}" style="color: #214d35; word-break: break-all;">${link}</a>
        </p>
        <p style="color: #5b6a61;">This link expires in ${TOKEN_TTL_MINUTES} minutes.</p>
        <p style="color: #5b6a61;">If you did not request this password reset, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function updatePasswordWithResetToken({
  token,
  password,
}: {
  token: string;
  password: string;
}) {
  if (!token) {
    return { ok: false, message: "Password reset token is missing." };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { ok: false, message: passwordError };
  }

  const admin = createAdminClient();
  const tokenHash = hashToken(token);

  const { data: resetToken, error: readError } = await admin
    .from("password_reset_tokens")
    .select("id,user_id,expires_at,used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle<{
      id: string;
      user_id: string;
      expires_at: string;
      used_at: string | null;
    }>();

  if (readError) {
    return { ok: false, message: readError.message };
  }

  if (!resetToken) {
    return { ok: false, message: "This password reset link is invalid." };
  }

  if (resetToken.used_at) {
    return { ok: false, message: "This password reset link has already been used." };
  }

  if (new Date(resetToken.expires_at).getTime() < Date.now()) {
    return { ok: false, message: "This password reset link has expired." };
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(
    resetToken.user_id,
    { password },
  );

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  const { error: consumeError } = await admin
    .from("password_reset_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", resetToken.id);

  if (consumeError) {
    return { ok: false, message: consumeError.message };
  }

  return { ok: true, message: "Password updated. You can log in now." };
}
