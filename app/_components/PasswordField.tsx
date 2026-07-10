"use client";

import { useId, useMemo, useState } from "react";

export function PasswordField({
  showStrength = false,
  confirm = false,
}: {
  showStrength?: boolean;
  confirm?: boolean;
}) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const inputId = useId();
  const confirmationId = useId();
  const warningId = useId();

  const checks = useMemo(
    () => [
      { label: "At least 8 characters", pass: password.length >= 8 },
      { label: "One uppercase letter", pass: /[A-Z]/.test(password) },
      { label: "One number", pass: /\d/.test(password) },
    ],
    [password],
  );

  const failedChecks = checks.filter((check) => !check.pass);
  const showWarning = showStrength && password.length > 0 && failedChecks.length > 0;
  const confirmationMismatch =
    confirm && confirmation.length > 0 && password !== confirmation;
  const confirmationMatches =
    confirm && confirmation.length > 0 && password === confirmation;

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-[#314239]">Password</span>
        <span className="relative mt-2 block">
          <input
            required
            id={inputId}
            name="password"
            type={visible ? "text" : "password"}
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby={showStrength ? warningId : undefined}
            className="w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 pr-14 outline-none transition focus:border-[#214d35]"
            placeholder="At least 8 characters"
          />
          <VisibilityButton
            visible={visible}
            onClick={() => setVisible((current) => !current)}
          />
        </span>
      </label>

      {showStrength ? (
        <div id={warningId} className="mt-3" aria-live="polite">
          {showWarning ? (
            <p className="rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
              Password needs {failedChecks.map((check) => check.label.toLowerCase()).join(", ")}.
            </p>
          ) : password.length > 0 ? (
            <p className="rounded-2xl bg-[#eef6ed] px-4 py-3 text-sm text-[#214d35]">
              Password looks good.
            </p>
          ) : (
            <p className="text-sm text-[#6a756d]">
              Use at least 8 characters with an uppercase letter and a number.
            </p>
          )}
        </div>
      ) : null}

      {confirm ? (
        <label className="block">
          <span className="text-sm font-medium text-[#314239]">
            Confirm password
          </span>
          <span className="relative mt-2 block">
            <input
              required
              id={confirmationId}
              name="confirmPassword"
              type={confirmationVisible ? "text" : "password"}
              minLength={8}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              pattern={password ? escapePattern(password) : undefined}
              className="w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 pr-14 outline-none transition focus:border-[#214d35]"
              placeholder="Re-enter password"
            />
            <VisibilityButton
              visible={confirmationVisible}
              onClick={() => setConfirmationVisible((current) => !current)}
            />
          </span>
          <div className="mt-3" aria-live="polite">
            {confirmationMismatch ? (
              <p className="rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
                Passwords do not match.
              </p>
            ) : confirmationMatches ? (
              <p className="rounded-2xl bg-[#eef6ed] px-4 py-3 text-sm text-[#214d35]">
                Passwords match.
              </p>
            ) : null}
          </div>
        </label>
      ) : null}
    </div>
  );
}

function VisibilityButton({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={visible ? "Hide password" : "Show password"}
      aria-pressed={visible}
      onClick={onClick}
      className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#5b6a61] transition hover:bg-[#eef6ed] hover:text-[#214d35]"
    >
      {visible ? (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 3l18 18" />
          <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58" />
          <path d="M9.88 5.09A9.77 9.77 0 0112 4c5 0 9 5 9 8a8.65 8.65 0 01-2.04 3.52" />
          <path d="M6.1 6.1C4.2 7.45 3 9.62 3 12c0 3 4 8 9 8a9.92 9.92 0 004.15-.92" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M2.5 12S6.5 5 12 5s9.5 7 9.5 7-4 7-9.5 7-9.5-7-9.5-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

function escapePattern(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
