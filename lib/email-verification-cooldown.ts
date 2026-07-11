export const EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS = 60;

export function getVerificationResendAvailableAt(createdAt: string | Date) {
  const createdAtMs =
    createdAt instanceof Date ? createdAt.getTime() : Date.parse(createdAt);

  if (!Number.isFinite(createdAtMs)) {
    return null;
  }

  return new Date(
    createdAtMs + EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS * 1000,
  ).toISOString();
}

export function getVerificationResendRemainingSeconds(
  availableAt: string | null | undefined,
  now = Date.now(),
) {
  if (!availableAt) {
    return 0;
  }

  const availableAtMs = Date.parse(availableAt);

  if (!Number.isFinite(availableAtMs)) {
    return 0;
  }

  return Math.max(0, Math.ceil((availableAtMs - now) / 1000));
}

export function getVerificationResendCooldownMessage(seconds: number) {
  return `Please wait ${seconds} second${seconds === 1 ? "" : "s"} before requesting another verification email.`;
}
