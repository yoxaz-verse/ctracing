import Link from "next/link";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type HomepageProject = {
  project_name: string;
  location: string;
  methodology: string;
  available_credits: number;
  price_per_credit: number;
  verification_status: string;
};

type HomepageSummary = {
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

const workflowSteps = [
  {
    label: "Seller",
    title: "List estimated supply",
    detail:
      "Project developers publish project location, methodology, available credits, indicative price, and verification status.",
  },
  {
    label: "Buyer",
    title: "Register purchase interest",
    detail:
      "Buyer teams compare listings and submit requested credit volume without turning the workflow into a transaction yet.",
  },
  {
    label: "Admin",
    title: "Monitor the marketplace",
    detail:
      "Operators review profiles, project inventory, and demand signals from a read-only control dashboard.",
  },
];

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

function formatCredits(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function MetricTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-3xl border border-[#d8ded2] bg-white p-6 shadow-sm">
      <p className="text-3xl font-semibold text-[#214d35]">{value}</p>
      <p className="mt-2 text-sm font-semibold text-[#17201b]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#5b6a61]">{detail}</p>
    </div>
  );
}

function RolePanel({
  label,
  title,
  items,
  muted = false,
}: {
  label: string;
  title: string;
  items: string[];
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl p-7 ring-1 ${
        muted
          ? "bg-[#e3eadf] ring-[#ccd8c6]"
          : "bg-white shadow-sm ring-[#dfe5dc]"
      }`}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
        {label}
      </p>
      <h3 className="mt-4 text-2xl font-semibold">{title}</h3>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex gap-3 rounded-2xl bg-[#f3f6f0] p-4 text-sm leading-6 text-[#5b6a61]"
          >
            <span className="mt-2 size-2 shrink-0 rounded-full bg-[#214d35]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function Home() {
  const { summary, unavailable } = await getHomepageSummary();
  const projects = summary.latest_projects;
  const hasProjects = projects.length > 0;
  const marketStats = [
    {
      label: "Estimated credits listed",
      value: `${formatCredits(summary.total_credits)} tCO2e`,
      detail: "Live total from seller-created project listings.",
    },
    {
      label: "Live project listings",
      value: formatCredits(summary.project_count),
      detail: "Projects currently visible in the marketplace database.",
    },
    {
      label: "Project regions",
      value: formatCredits(summary.region_count),
      detail: "Distinct regions derived from project listing locations.",
    },
    {
      label: "Verification statuses",
      value: formatCredits(summary.verification_status_count),
      detail: "Distinct verification states across live listings.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f7f3] text-[#17201b]">
      <section className="border-b border-[#d8ded2] bg-[#eef3ec]">
        <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            TeraTrace
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-full border border-[#b7c2b1] px-4 py-2 text-sm font-medium text-[#263a2e] transition hover:border-[#214d35]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#214d35] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#183b28]"
            >
              Create account
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-10 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:pb-20">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#c8d2c2] bg-white/70 px-4 py-2 text-sm font-medium text-[#45624f]">
              Carbon credit marketplace foundation
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-[#142019] md:text-7xl">
              Traceable carbon supply for buyers and project developers.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#526158]">
              TeraTrace gives sustainability teams a cleaner way to list
              projects, discover estimated carbon credit supply, register
              purchase interest, and monitor verification status before any
              transaction workflow is introduced.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-[#214d35] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#183b28]"
              >
                Start as buyer or seller
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-[#b7c2b1] px-6 py-3 text-center text-sm font-semibold text-[#214d35] transition hover:border-[#214d35]"
              >
                View existing dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d5ddd0] bg-white p-4 shadow-[0_24px_80px_rgba(26,45,33,0.12)]">
            <div className="rounded-[1.5rem] bg-[#17201b] p-5 text-white">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm text-white/60">Marketplace signal</p>
                  <h2 className="text-2xl font-semibold">Live supply board</h2>
                </div>
                <span className="rounded-full bg-[#d7f96f] px-3 py-1 text-xs font-semibold text-[#17201b]">
                  {hasProjects ? "Database" : "No listings yet"}
                </span>
              </div>

              {hasProjects ? (
                <div className="mt-5 space-y-3">
                  {projects.slice(0, 3).map((project) => (
                    <article
                      key={`${project.project_name}-${project.location}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-[#d7f96f]">
                            {project.methodology}
                          </p>
                          <h3 className="mt-2 font-semibold">
                            {project.project_name}
                          </h3>
                          <p className="mt-1 text-sm text-white/60">
                            {project.location}
                          </p>
                        </div>
                        <p className="whitespace-nowrap text-sm font-semibold">
                          {formatCredits(project.available_credits)} credits
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-white/70">
                        <span>{project.verification_status}</span>
                        <span>{formatPrice(project.price_per_credit)}/credit</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-white/[0.04] p-6">
                  <p className="text-lg font-semibold">
                    No live projects listed yet.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/65">
                    When a verified seller creates a project listing, this board
                    will show real project previews and marketplace totals from
                    Supabase.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
              Live market snapshot
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Real values from current marketplace records.
            </h2>
          </div>
          {unavailable ? (
            <p className="rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
              Homepage summary RPC is not available yet. Run the included
              Supabase migration to enable live public metrics.
            </p>
          ) : (
            <p className="text-sm text-[#5b6a61]">
              Updated directly from seller project listings.
            </p>
          )}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {marketStats.map((stat) => (
            <MetricTile key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section className="border-y border-[#d8ded2] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
            How it works
          </p>
          <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight">
            One flow for supply, demand, and platform oversight.
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <article
                key={step.label}
                className="rounded-3xl border border-[#d8ded2] bg-[#f3f6f0] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#214d35] px-3 py-1 text-xs font-semibold text-white">
                    {step.label}
                  </span>
                  <span className="text-3xl font-semibold text-[#214d35]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-2xl font-semibold">{step.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#5b6a61]">
                  {step.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <RolePanel
            label="For buyers"
            title="Compare projects and record purchase interest."
            items={[
              "Review estimated credits, methodology, location, and status.",
              "Submit a requested credit volume for a selected project.",
              "Track submitted purchase-interest records from one workspace.",
            ]}
          />
          <RolePanel
            label="For sellers"
            title="Manage listings and buyer demand signals."
            items={[
              "Create project listings with indicative price and supply.",
              "Update verification status as documentation changes.",
              "View buyer inquiry records tied to seller-owned projects.",
            ]}
            muted
          />
          <RolePanel
            label="Admin dashboard"
            title="See the platform without changing marketplace records."
            items={[
              "Monitor buyers, sellers, listings, and purchase-interest count.",
              "Review real marketplace coverage and estimated supply.",
              "Keep admin access separate from public buyer and seller signup.",
            ]}
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-20 lg:grid-cols-[0.75fr_0.45fr]">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-[#dfe5dc]">
          <div className="flex flex-col gap-2 border-b border-[#e2e8df] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
                Latest public project previews
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                Current listings without private account data.
              </h2>
            </div>
            <span className="rounded-full bg-[#eef6ed] px-3 py-1 text-xs font-semibold text-[#214d35]">
              {formatCredits(projects.length)} shown
            </span>
          </div>

          {hasProjects ? (
            <div className="mt-6 grid gap-4">
              {projects.map((project) => (
                <article
                  key={`${project.project_name}-${project.location}-preview`}
                  className="rounded-2xl border border-[#e0e7dc] p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#557462]">
                        {project.methodology}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">
                        {project.project_name}
                      </h3>
                      <p className="mt-1 text-sm text-[#6a756d]">
                        {project.location}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#f3f6f0] px-3 py-1 text-sm font-semibold text-[#314239]">
                      {project.verification_status}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                      Estimated credits{" "}
                      <span className="block text-lg font-semibold text-[#17201b]">
                        {formatCredits(project.available_credits)}
                      </span>
                    </p>
                    <p className="rounded-2xl bg-[#f3f6f0] p-4 text-sm text-[#5b6a61]">
                      Indicative price{" "}
                      <span className="block text-lg font-semibold text-[#17201b]">
                        {formatPrice(project.price_per_credit)}/credit
                      </span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-[#cbd5c5] p-6 text-sm leading-6 text-[#5b6a61]">
              No live projects listed yet. The homepage will show real project
              previews here after sellers publish listings from their dashboard.
            </div>
          )}
        </div>

        <aside className="rounded-3xl bg-[#17201b] p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d7f96f]">
            Interaction map
          </p>
          <h2 className="mt-4 text-3xl font-semibold">
            What users can do after login.
          </h2>
          <div className="mt-8 space-y-4">
            {[
              ["Buyer", "Discover listings and submit purchase interest."],
              ["Seller", "Create listings and review demand signals."],
              ["Admin", "Monitor platform totals and all marketplace records."],
            ].map(([label, detail]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
              >
                <p className="font-semibold">{label}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  {detail}
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/signup"
            className="accent-cta mt-8 inline-flex rounded-full px-5 py-3 text-sm font-semibold transition"
          >
            Create a workspace
          </Link>
        </aside>
      </section>
    </main>
  );
}
