"use client";

import { EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS } from "@/lib/email-verification-cooldown";

export const VERIFICATION_RESEND_COOLDOWN_EVENT =
  "teratrace:verification-resend-cooldown";
export const VERIFICATION_RESEND_COOLDOWN_KEY =
  "teratrace:verification-resend-available-at";

export function getDefaultVerificationResendAvailableAtMs() {
  return Date.now() + EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS * 1000;
}

export function rememberVerificationResendCooldown(availableAt?: string | null) {
  const availableAtMs = availableAt
    ? Date.parse(availableAt)
    : getDefaultVerificationResendAvailableAtMs();

  if (!Number.isFinite(availableAtMs)) {
    return;
  }

  window.localStorage.setItem(
    VERIFICATION_RESEND_COOLDOWN_KEY,
    String(availableAtMs),
  );
  window.dispatchEvent(
    new CustomEvent(VERIFICATION_RESEND_COOLDOWN_EVENT, {
      detail: { availableAtMs },
    }),
  );
}

export function readStoredVerificationResendAvailableAtMs() {
  const storedValue = window.localStorage.getItem(
    VERIFICATION_RESEND_COOLDOWN_KEY,
  );
  const storedMs = storedValue ? Number(storedValue) : 0;

  return Number.isFinite(storedMs) ? storedMs : 0;
}
