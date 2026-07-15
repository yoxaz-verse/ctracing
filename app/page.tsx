import { HomeLandingExperience } from "@/app/_components/HomeLandingExperience";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl, jsonLd, pageMetadata, siteName } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Carbon Credit Marketplace India for Buyers and Sellers",
  description:
    "TeraTrace helps Indian carbon credit buyers, project sellers, and facilitators review live supply, verification context, pricing signals, and marketplace interest.",
  path: "/",
});

export type HomepageProject = {
  project_name: string;
  location: string;
  methodology: string;
  available_credits: number;
  price_per_credit: number;
  verification_status: string;
};

export type HomepageSummary = {
  total_credits: number;
  project_count: number;
  region_count: number;
  verification_status_count: number;
  average_price: number;
  latest_projects: HomepageProject[];
};

const emptySummary: HomepageSummary = {
  total_credits: 0,
  project_count: 0,
  region_count: 0,
  verification_status_count: 0,
  average_price: 0,
  latest_projects: [],
};

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asProject(value: unknown): HomepageProject | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Partial<HomepageProject>;
  if (
    typeof row.project_name !== "string" ||
    typeof row.location !== "string" ||
    typeof row.methodology !== "string" ||
    typeof row.verification_status !== "string"
  ) {
    return null;
  }

  return {
    project_name: row.project_name,
    location: row.location,
    methodology: row.methodology,
    available_credits: asNumber(row.available_credits),
    price_per_credit: asNumber(row.price_per_credit),
    verification_status: row.verification_status,
  };
}

function normalizeSummary(value: unknown): HomepageSummary {
  if (!value || typeof value !== "object") {
    return emptySummary;
  }

  const summary = value as Partial<HomepageSummary>;
  const latestProjects = Array.isArray(summary.latest_projects)
    ? summary.latest_projects.map(asProject).filter((project) => project !== null)
    : [];

  return {
    total_credits: asNumber(summary.total_credits),
    project_count: asNumber(summary.project_count),
    region_count: asNumber(summary.region_count),
    verification_status_count: asNumber(summary.verification_status_count),
    average_price: asNumber(summary.average_price),
    latest_projects: latestProjects,
  };
}

async function getHomepageSummary() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("homepage_marketplace_summary");

    if (error) {
      return { summary: emptySummary, unavailable: true };
    }

    return { summary: normalizeSummary(data), unavailable: false };
  } catch {
    return { summary: emptySummary, unavailable: true };
  }
}

export default async function Home() {
  const { summary, unavailable } = await getHomepageSummary();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: absoluteUrl("/"),
      description: metadata.description,
      inLanguage: "en-IN",
      potentialAction: {
        "@type": "SearchAction",
        target: `${absoluteUrl("/")}?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/favicon.svg"),
      description:
        "TeraTrace provides a carbon credit marketplace layer for buyers, project sellers, and facilitators in India.",
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteName,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: absoluteUrl("/"),
      description:
        "India-first carbon credit marketplace software for reviewing project supply, buyer interest, facilitator matches, and verification status.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <HomeLandingExperience summary={summary} unavailable={unavailable} />
    </>
  );
}
