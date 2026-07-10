import Link from "next/link";
import { logIn } from "@/app/auth/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { PasswordField } from "@/app/_components/PasswordField";
import { ThemeToggle } from "@/app/_components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
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
          Log in to your workspace
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#5b6a61]">
          Access buyer discovery tools or seller project inventory based on your
          saved company role.
        </p>

        {params.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {params.error}
          </p>
        ) : null}

        <form action={logIn} className="mt-6 space-y-4">
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
          <PasswordField />
          <PendingButton
            idleLabel="Log in"
            pendingLabel="Checking account..."
            className="w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183b28]"
          />
        </form>

        <p className="mt-6 text-center text-sm text-[#5b6a61]">
          Need an account?{" "}
          <Link href="/signup" className="font-semibold text-[#214d35]">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}
