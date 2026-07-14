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
  activeRole: "buyer" | "seller" | "facilitator" | "admin";
  children: React.ReactNode;
}) {
  const workspaceLabel =
    activeRole === "admin"
      ? "Admin workspace"
      : activeRole === "facilitator"
        ? "Facilitator workspace"
      : activeRole === "seller"
        ? "Seller workspace"
        : "Buyer workspace";
  const workflowLinks =
    activeRole === "buyer"
      ? [
          ["Overview", "/dashboard/buyer"],
          ["Estimator", "/dashboard/estimator"],
          ["Projects", "/dashboard/buyer/projects"],
          ["Interests", "/dashboard/buyer/interests"],
          ["Profile", "/dashboard/buyer/profile"],
        ]
      : activeRole === "seller"
        ? [
            ["Overview", "/dashboard/seller"],
            ["Estimator", "/dashboard/estimator"],
            ["Projects", "/dashboard/seller/projects"],
            ["Inquiries", "/dashboard/seller/inquiries"],
            ["Profile", "/dashboard/seller/profile"],
          ]
        : activeRole === "facilitator"
          ? [
              ["Overview", "/dashboard/facilitator"],
              ["Matches", "/dashboard/facilitator/matches"],
              ["Buyers", "/dashboard/facilitator/buyers"],
              ["Sellers", "/dashboard/facilitator/sellers"],
              ["Projects", "/dashboard/facilitator/projects"],
              ["Messages", "/dashboard/facilitator/messages"],
              ["Profile", "/dashboard/facilitator/profile"],
            ]
        : [
            ["Overview", "/dashboard/admin"],
            ["Estimator", "/dashboard/estimator"],
            ["Factors", "/dashboard/admin/factors"],
            ["Reviews", "/dashboard/admin/reviews"],
            ["Users", "/dashboard/admin/users"],
            ["Audit", "/dashboard/admin/audit"],
          ];

  return (
    <main className="min-h-screen bg-[#f5f7f3] text-[#17201b]">
      <header className="border-b border-[#d8ded2] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-xl font-semibold text-[#214d35]">
              TeraTrace
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eef6ed] px-3 py-1 text-xs font-semibold text-[#214d35]">
                {workspaceLabel}
              </span>
              <span className="text-sm text-[#6a756d]">
                {profile.company_name || profile.email}
              </span>
              {profile.company_verification_status === "verified" ? (
                <span className="rounded-full bg-[#214d35] px-3 py-1 text-xs font-semibold text-white">
                  ✓ Verified company
                </span>
              ) : profile.role !== "admin" ? (
                <span className="rounded-full bg-[#fff7df] px-3 py-1 text-xs font-semibold text-[#795b12]">
                  Company {profile.company_verification_status ?? "pending"}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {profile.role === "admin" ? (
              <Link
                href="/dashboard/admin"
                className="rounded-full bg-[#214d35] px-4 py-2 text-sm font-semibold text-white"
              >
                Admin
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
      <div className="border-b border-[#d8ded2] bg-[#f5f7f3]">
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-3">
          {workflowLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap rounded-full border border-[#c8d2c2] bg-white px-4 py-2 text-sm font-semibold text-[#314239] hover:border-[#214d35]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
    </main>
  );
}
