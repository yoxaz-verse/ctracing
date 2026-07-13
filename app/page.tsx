import { HomeLandingExperience } from "@/app/_components/HomeLandingExperience";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

  return <HomeLandingExperience summary={summary} unavailable={unavailable} />;
}
