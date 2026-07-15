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
    </>
  );
}
