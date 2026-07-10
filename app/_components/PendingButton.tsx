"use client";

import { useFormStatus } from "react-dom";

export function PendingButton({
  idleLabel,
  pendingLabel,
  className,
}: {
  idleLabel: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`${className} inline-flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-80`}
      disabled={pending}
      aria-live="polite"
    >
      {pending ? (
        <span
          className="h-4 w-4 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin"
          aria-hidden="true"
        />
      ) : null}
      <span>{pending ? pendingLabel : idleLabel}</span>
    </button>
  );
}
