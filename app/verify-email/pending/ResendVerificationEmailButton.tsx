"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  readStoredVerificationResendAvailableAtMs,
  rememberVerificationResendCooldown,
  VERIFICATION_RESEND_COOLDOWN_EVENT,
  VERIFICATION_RESEND_COOLDOWN_KEY,
} from "./resendCooldown";

function getInitialAvailableAtMs(initialAvailableAt: string | null) {
  if (!initialAvailableAt) {
    return 0;
  }

  const parsed = Date.parse(initialAvailableAt);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getRemainingSeconds(availableAtMs: number) {
  if (!availableAtMs) {
    return 0;
  }

  return Math.max(0, Math.ceil((availableAtMs - Date.now()) / 1000));
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function ResendVerificationEmailButton({
  initialAvailableAt,
  className,
}: {
  initialAvailableAt: string | null;
  className: string;
}) {
  const { pending } = useFormStatus();
  const [availableAtMs, setAvailableAtMs] = useState(() =>
    getInitialAvailableAtMs(initialAvailableAt),
  );
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getRemainingSeconds(getInitialAvailableAtMs(initialAvailableAt)),
  );

  useEffect(() => {
    function syncAvailableAt(nextAvailableAtMs: number) {
      setAvailableAtMs((currentAvailableAtMs) =>
        Math.max(currentAvailableAtMs, nextAvailableAtMs),
      );
    }

    syncAvailableAt(readStoredVerificationResendAvailableAtMs());

    function handleCooldown(event: Event) {
      const customEvent = event as CustomEvent<{ availableAtMs?: number }>;
      const nextAvailableAtMs = customEvent.detail?.availableAtMs ?? 0;

      if (Number.isFinite(nextAvailableAtMs)) {
        syncAvailableAt(nextAvailableAtMs);
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== VERIFICATION_RESEND_COOLDOWN_KEY || !event.newValue) {
        return;
      }

      const nextAvailableAtMs = Number(event.newValue);

      if (Number.isFinite(nextAvailableAtMs)) {
        syncAvailableAt(nextAvailableAtMs);
      }
    }

    window.addEventListener(VERIFICATION_RESEND_COOLDOWN_EVENT, handleCooldown);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        VERIFICATION_RESEND_COOLDOWN_EVENT,
        handleCooldown,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    function tick() {
      setRemainingSeconds(getRemainingSeconds(availableAtMs));
    }

    tick();

    if (!availableAtMs || availableAtMs <= Date.now()) {
      return;
    }

    const intervalId = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [availableAtMs]);

  const disabled = pending || remainingSeconds > 0;
  const label = useMemo(() => {
    if (pending) {
      return "Sending email...";
    }

    if (remainingSeconds > 0) {
      return `Resend available in ${formatCountdown(remainingSeconds)}`;
    }

    return "Resend verification email";
  }, [pending, remainingSeconds]);

  return (
    <button
      className={`${className} inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70`}
      disabled={disabled}
      aria-live="polite"
      onClick={() => {
        rememberVerificationResendCooldown();
      }}
    >
      {pending ? (
        <span
          className="h-4 w-4 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin"
          aria-hidden="true"
        />
      ) : null}
      <span>{label}</span>
    </button>
  );
}
