import Link from "next/link";
import { PendingButton } from "@/app/_components/PendingButton";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import { requestPasswordReset } from "@/app/auth/actions";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Reset TeraTrace Password",
  description:
    "Request a password reset link for a TeraTrace carbon credit marketplace workspace.",
  path: "/forgot-password",
});

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef3ec] px-6 py-12">
      <ThemeToggle className="fixed right-6 top-6 z-50" />
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-[#d8ded2]">
        <Link href="/" className="text-lg font-semibold text-[#214d35]">
          TeraTrace
        </Link>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#5b6a61]">
          Enter your account email. TeraTrace will send a password reset link
          through the configured SMTP sender.
        </p>

        {params.sent ? (
          <p className="mt-5 rounded-2xl bg-[#eef6ed] px-4 py-3 text-sm text-[#214d35]">
            If an account exists for that email, we sent a password reset link.
          </p>
        ) : null}

        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}

        <form action={requestPasswordReset} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#314239]">Email</span>
            <input
              required
              name="email"
              type="email"
              className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
              placeholder="you@company.com"
            />
          </label>
          <PendingButton
            idleLabel="Send reset link"
            pendingLabel="Sending reset link..."
            className="w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183b28]"
          />
        </form>

        <p className="mt-6 text-center text-sm text-[#5b6a61]">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-[#214d35]">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
