"use client";

import { useEffect, useState } from "react";
import { rememberVerificationResendCooldown } from "./resendCooldown";

type SendState = "idle" | "sending" | "sent" | "failed";

export function AutoSendVerificationEmail({ shouldSend }: { shouldSend: boolean }) {
  const [state, setState] = useState<SendState>(shouldSend ? "sending" : "idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!shouldSend) {
      return;
    }

    let cancelled = false;

    async function sendEmail() {
      setState("sending");
      setMessage("");

      try {
        const response = await fetch("/api/verify-email/resend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const body = (await response.json()) as {
          message?: string;
          cooldownAvailableAt?: string | null;
        };

        if (cancelled) {
          return;
        }

        setMessage(body.message ?? "Verification email request finished.");
        setState(response.ok ? "sent" : "failed");

        if (response.ok || response.status === 429) {
          rememberVerificationResendCooldown(body.cooldownAvailableAt);
        }
      } catch {
        if (!cancelled) {
          setState("failed");
          setMessage("Could not send the verification email. Try again.");
        }
      }
    }

    void sendEmail();

    return () => {
      cancelled = true;
    };
  }, [shouldSend]);

  if (state === "idle") {
    return null;
  }

  const isError = state === "failed";

  return (
    <p
      className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
        isError ? "bg-[#fff1ed] text-[#8a2c16]" : "bg-[#eef6ed] text-[#214d35]"
      }`}
      aria-live="polite"
    >
      {state === "sending" ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin"
            aria-hidden="true"
          />
          Sending verification email from TeraTrace...
        </span>
      ) : (
        message
      )}
    </p>
  );
}
