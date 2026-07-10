import Link from "next/link";
import { logOut } from "@/app/auth/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import type { Profile } from "@/lib/types";

export function DashboardShell({
  profile,
  activeRole,
  children,
}: {
  profile: Profile;
  activeRole: "buyer" | "seller" | "admin";
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7f3] text-[#17201b]">
      <header className="border-b border-[#d8ded2] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-xl font-semibold text-[#214d35]">
              TeraTrace
            </Link>
            <p className="mt-1 text-sm text-[#6a756d]">
              {profile.company_name || profile.email}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard/buyer"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeRole === "buyer"
                  ? "bg-[#214d35] text-white"
                  : "border border-[#c8d2c2] text-[#314239]"
              }`}
            >
              Buyer dashboard
            </Link>
            <Link
              href="/dashboard/seller"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeRole === "seller"
                  ? "bg-[#214d35] text-white"
                  : "border border-[#c8d2c2] text-[#314239]"
              }`}
            >
              Seller dashboard
            </Link>
            {profile.role === "admin" ? (
              <Link
                href="/dashboard/admin"
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  activeRole === "admin"
                    ? "bg-[#214d35] text-white"
                    : "border border-[#c8d2c2] text-[#314239]"
                }`}
              >
                Admin dashboard
              </Link>
            ) : null}
            <form action={logOut}>
              <PendingButton
                idleLabel="Log out"
                pendingLabel="Signing out..."
                className="rounded-full border border-[#c8d2c2] px-4 py-2 text-sm font-semibold text-[#314239]"
              />
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
    </main>
  );
}
