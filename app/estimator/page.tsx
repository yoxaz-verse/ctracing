import Link from "next/link";
import { CarbonEstimator } from "@/app/_components/CarbonEstimator";
import { ThemeToggle } from "@/app/_components/ThemeToggle";

export const dynamic = "force-dynamic";

export default function PublicEstimatorPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <Link href="/" className="text-xl font-semibold text-[var(--brand)]">
            TeraTrace
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-[var(--surface)]"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-6">
        <CarbonEstimator mode="public" />
      </div>
    </main>
  );
}
