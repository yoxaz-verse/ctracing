import Link from "next/link";
import { logOut } from "@/app/auth/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import {
  DashboardMobileNav,
  type DashboardNavLink,
} from "@/app/dashboard/_components/DashboardMobileNav";
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
  const workflowLinks: DashboardNavLink[] =
    activeRole === "buyer"
      ? [
          { label: "Overview", href: "/dashboard/buyer" },
          { label: "Estimator", href: "/dashboard/estimator" },
          { label: "Projects", href: "/dashboard/buyer/projects" },
          { label: "Interests", href: "/dashboard/buyer/interests" },
          { label: "Profile", href: "/dashboard/buyer/profile" },
        ]
      : activeRole === "seller"
        ? [
            { label: "Overview", href: "/dashboard/seller" },
            { label: "Estimator", href: "/dashboard/estimator" },
            { label: "Projects", href: "/dashboard/seller/projects" },
            { label: "Inquiries", href: "/dashboard/seller/inquiries" },
            { label: "Profile", href: "/dashboard/seller/profile" },
          ]
        : activeRole === "facilitator"
          ? [
              { label: "Overview", href: "/dashboard/facilitator" },
              { label: "Matches", href: "/dashboard/facilitator/matches" },
              { label: "Buyers", href: "/dashboard/facilitator/buyers" },
              { label: "Sellers", href: "/dashboard/facilitator/sellers" },
              { label: "Projects", href: "/dashboard/facilitator/projects" },
              { label: "Messages", href: "/dashboard/facilitator/messages" },
              { label: "Profile", href: "/dashboard/facilitator/profile" },
            ]
        : [
            { label: "Overview", href: "/dashboard/admin" },
            { label: "Estimator", href: "/dashboard/estimator" },
            { label: "Factors", href: "/dashboard/admin/factors" },
            { label: "Reviews", href: "/dashboard/admin/reviews" },
            { label: "Users", href: "/dashboard/admin/users" },
            { label: "Audit", href: "/dashboard/admin/audit" },
          ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <header className="hidden border-b border-[var(--border)] bg-[var(--surface)] md:block">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-xl font-semibold text-[var(--brand)]">
              TeraTrace
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--surface-positive)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
                {workspaceLabel}
              </span>
              <span className="text-sm text-[var(--text-soft)]">
                {profile.company_name || profile.email}
              </span>
              {profile.company_verification_status === "verified" ? (
                <span className="rounded-full bg-[var(--brand)] px-3 py-1 text-xs font-semibold text-[var(--surface)]">
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
                className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--surface)]"
              >
                Admin
              </Link>
            ) : null}
            <form action={logOut}>
              <PendingButton
                idleLabel="Log out"
                pendingLabel="Signing out..."
                className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-label)]"
              />
            </form>
          </div>
        </div>
      </header>
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] shadow-sm backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Link
              href="/"
              className="block text-lg font-semibold leading-tight text-[var(--brand)]"
            >
              TeraTrace
            </Link>
            <p className="mt-1 truncate text-xs font-medium text-[var(--text-soft)]">
              {profile.company_name || profile.email}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle className="scale-[0.82]" />
            {profile.role === "admin" ? (
              <Link
                href="/dashboard/admin"
                className="rounded-full bg-[var(--brand)] px-3 py-2 text-xs font-semibold text-[var(--surface)]"
              >
                Admin
              </Link>
            ) : null}
            <form action={logOut}>
              <PendingButton
                idleLabel="Out"
                pendingLabel="..."
                className="h-10 rounded-full border border-[var(--border-strong)] px-3 text-xs font-semibold text-[var(--text-label)]"
              />
            </form>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 overflow-hidden">
          <span className="shrink-0 rounded-full bg-[var(--surface-positive)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
            {workspaceLabel}
          </span>
          {profile.company_verification_status === "verified" ? (
            <span className="truncate rounded-full bg-[var(--brand)] px-3 py-1 text-xs font-semibold text-[var(--surface)]">
              Verified company
            </span>
          ) : profile.role !== "admin" ? (
            <span className="truncate rounded-full bg-[#fff7df] px-3 py-1 text-xs font-semibold text-[#795b12]">
              Company {profile.company_verification_status ?? "pending"}
            </span>
          ) : null}
        </div>
      </header>
      <div className="hidden border-b border-[var(--border)] bg-[var(--surface-soft)] md:block">
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-3">
          {workflowLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text-label)] hover:border-[var(--brand)]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="dashboard-app-content mx-auto max-w-7xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-5 md:px-6 md:py-8">
        {children}
      </div>
      <DashboardMobileNav links={workflowLinks} />
    </main>
  );
}
