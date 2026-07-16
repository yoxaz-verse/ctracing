import Link from "next/link";
import { CarbonEstimator } from "@/app/_components/CarbonEstimator";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Carbon Credit Estimator India",
  description:
    "Use the TeraTrace carbon credit estimator to explore project assumptions, estimated impact, and credit supply scenarios before creating an India carbon marketplace workspace.",
  path: "/estimator",
});

export default function PublicEstimatorPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "TeraTrace Carbon Credit Estimator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/estimator"),
    description: metadata.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <main className="min-h-screen bg-[var(--background)] text-[var(--text)]">
        <header className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
            <Link href="/" className="shrink-0 text-lg font-semibold text-[var(--brand)] sm:text-xl">
              TeraTrace
            </Link>
            <div className="flex min-w-0 shrink-0 items-center gap-2">
              <ThemeToggle variant="icon" />
              <Link
                href="/blog"
                className="whitespace-nowrap rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--brand)] sm:px-3.5 sm:text-sm"
              >
                Blog
              </Link>
              <Link
                href="/login"
                className="whitespace-nowrap rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--brand)] sm:px-3.5 sm:text-sm"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="whitespace-nowrap rounded-full bg-[var(--brand)] px-3.5 py-1.5 text-xs font-semibold text-[var(--surface)] transition hover:bg-[var(--brand-hover)] sm:px-4 sm:text-sm"
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
    </>
  );
}
