import Link from "next/link";
import { verifyEmailToken } from "@/lib/email-verification";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await verifyEmailToken(token ?? "");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef3ec] px-6 py-12">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-sm ring-1 ring-[#d8ded2]">
        <Link href="/" className="text-lg font-semibold text-[#214d35]">
          TeraTrace
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Email verification
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {result.ok ? "Your email is verified." : "Verification link issue"}
        </h1>
        <p
          className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
            result.ok
              ? "bg-[#eef6ed] text-[#214d35]"
              : "bg-[#fff1ed] text-[#8a2c16]"
          }`}
        >
          {result.message}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-full bg-[#214d35] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#183b28]"
          >
            Go to login
          </Link>
          <Link
            href="/verify-email/pending"
            className="rounded-full border border-[#c8d2c2] px-5 py-3 text-center text-sm font-semibold text-[#314239]"
          >
            Resend link
          </Link>
        </div>
      </section>
    </main>
  );
}
