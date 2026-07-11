import Link from "next/link";
import { PasswordField } from "@/app/_components/PasswordField";
import { PendingButton } from "@/app/_components/PendingButton";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import { resetPassword } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef3ec] px-6 py-12">
      <ThemeToggle className="fixed right-6 top-6 z-50" />
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-[#d8ded2]">
        <Link href="/" className="text-lg font-semibold text-[#214d35]">
          TeraTrace
        </Link>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight">
          Choose a new password
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#5b6a61]">
          Use a strong password for your carbon marketplace workspace.
        </p>

        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}

        {!token ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#cbd5c5] p-5 text-sm leading-6 text-[#5b6a61]">
            This reset link is missing a token. Request a fresh password reset
            link to continue.
          </div>
        ) : (
          <form action={resetPassword} className="mt-6 space-y-5">
            <input type="hidden" name="token" value={token} />
            <PasswordField showStrength confirm />
            <PendingButton
              idleLabel="Update password"
              pendingLabel="Updating password..."
              className="w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183b28]"
            />
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#5b6a61]">
          Need a new link?{" "}
          <Link href="/forgot-password" className="font-semibold text-[#214d35]">
            Request reset
          </Link>
        </p>
      </section>
    </main>
  );
}
