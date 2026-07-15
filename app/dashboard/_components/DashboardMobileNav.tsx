"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type DashboardNavLink = {
  label: string;
  href: string;
};

function getIconPath(label: string) {
  switch (label) {
    case "Estimator":
      return (
        <>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="m7 15 3-3 3 2 4-6" />
        </>
      );
    case "Projects":
      return (
        <>
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h3l2 2h6A2.5 2.5 0 0 1 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5Z" />
          <path d="M8 12h8" />
        </>
      );
    case "Interests":
    case "Inquiries":
    case "Messages":
      return (
        <>
          <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v5A2.5 2.5 0 0 1 16.5 15H11l-4 4v-4.2A2.5 2.5 0 0 1 5 12.5Z" />
          <path d="M8 9h8" />
          <path d="M8 12h5" />
        </>
      );
    case "Profile":
    case "Users":
      return (
        <>
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </>
      );
    case "Matches":
      return (
        <>
          <path d="M7 7h10" />
          <path d="M7 17h10" />
          <path d="m9 4-3 3 3 3" />
          <path d="m15 14 3 3-3 3" />
        </>
      );
    case "Buyers":
    case "Sellers":
      return (
        <>
          <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M2.5 20a5.5 5.5 0 0 1 11 0" />
          <path d="M12.5 20a5.5 5.5 0 0 1 9 0" />
        </>
      );
    case "Factors":
      return (
        <>
          <path d="M5 12h14" />
          <path d="M12 5v14" />
          <path d="M7 7l10 10" />
          <path d="m17 7-10 10" />
        </>
      );
    case "Reviews":
    case "Audit":
      return (
        <>
          <path d="M8 4h8l2 2v14H6V6Z" />
          <path d="M9 11h6" />
          <path d="M9 15h4" />
        </>
      );
    default:
      return (
        <>
          <path d="M4 10.5 12 4l8 6.5" />
          <path d="M6.5 10V20h11V10" />
          <path d="M10 20v-5h4v5" />
        </>
      );
  }
}

function isActivePath(pathname: string, href: string, links: DashboardNavLink[]) {
  const matches = links
    .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
    .sort((a, b) => b.href.length - a.href.length);

  return matches[0]?.href === href;
}

export function DashboardMobileNav({ links }: { links: DashboardNavLink[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard sections"
      className="dashboard-mobile-tabs fixed inset-x-0 bottom-0 z-40 flex gap-2 overflow-x-auto border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-3 pb-[calc(0.7rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-18px_40px_rgba(23,32,27,0.12)] backdrop-blur-xl md:hidden"
    >
      {links.map((link) => {
        const active = isActivePath(pathname, link.href, links);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`flex min-w-[4.7rem] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-[0.72rem] font-semibold leading-none ${
              active
                ? "bg-[var(--brand)] text-[var(--surface)] shadow-sm"
                : "text-[var(--text-soft)] hover:bg-[var(--surface-subtle)] hover:text-[var(--brand)]"
            }`}
            href={link.href}
            key={link.href}
          >
            <svg
              aria-hidden="true"
              className="size-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.9"
              viewBox="0 0 24 24"
            >
              {getIconPath(link.label)}
            </svg>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
