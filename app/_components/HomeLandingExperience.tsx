"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { HomepageProject, HomepageSummary } from "@/app/page";
import { CarbonEstimator } from "@/app/_components/CarbonEstimator";
import { ThemeToggle } from "@/app/_components/ThemeToggle";

type HomeLandingExperienceProps = {
  summary: HomepageSummary;
  unavailable: boolean;
};

const chapters = [
  {
    eyebrow: "Carbon credit marketplace foundation",
    title: "Trusted visibility into carbon credit supply.",
    body: "TeraTrace helps buyers, project developers, and operators see estimated supply, verification status, and purchase interest in one clean marketplace layer.",
    proof: "Live supply, demand, and review signals in one operating surface.",
  },
  {
    eyebrow: "Live market intelligence",
    title: "Real records, staged for faster diligence.",
    body: "Listings move from raw project data into a structured console that sustainability teams can compare without losing methodology, status, or pricing context.",
    proof: "Supabase-backed totals and latest project previews.",
  },
  {
    eyebrow: "Role-aware workflows",
    title: "A cleaner path for buyers, sellers, and operators.",
    body: "Each workspace gets the right controls: sellers publish credible supply, buyers express demand, and admins keep marketplace quality visible.",
    proof: "Three operating views without mixing permissions.",
  },
  {
    eyebrow: "Verification and oversight",
    title: "Professional enough for serious carbon decisions.",
    body: "TeraTrace keeps claims, inventory, and market interest legible before transaction workflows begin, so teams can move with more confidence.",
    proof: "Designed for high-value carbon credit discovery.",
  },
];

const workflowSteps = [
  {
    label: "Seller",
    title: "Publish credible supply",
    detail:
      "Project developers list location, methodology, estimated volume, price guidance, and verification progress.",
  },
  {
    label: "Buyer",
    title: "Compare demand fit",
    detail:
      "Sustainability teams review live listings and record purchase interest before a transaction workflow begins.",
  },
  {
    label: "Admin",
    title: "Watch market health",
    detail:
      "Operators monitor inventory, users, verification coverage, and inquiry signals from a focused control layer.",
  },
];

const rolePanels = [
  {
    label: "For buyers",
    title: "Shortlist supply with confidence.",
    items: [
      "Compare methodology, status, region, and indicative price.",
      "Submit requested credit volume against selected projects.",
      "Track purchase-interest records from one workspace.",
    ],
  },
  {
    label: "For sellers",
    title: "Turn project inventory into clear market signals.",
    items: [
      "Create structured listings for estimated carbon credit supply.",
      "Submit project documentation for admin review.",
      "Review demand signals tied to seller-owned projects.",
    ],
  },
  {
    label: "For admins",
    title: "Keep the marketplace measurable.",
    items: [
      "Monitor buyers, sellers, listings, and interest volume.",
      "Review marketplace coverage without changing public records.",
      "Separate platform oversight from buyer and seller workflows.",
    ],
  },
];

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

function ConsoleMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3">
      <p className="text-lg font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/50">
        {label}
      </p>
    </div>
  );
}

function SupplyConsole({
  summary,
  projects,
  hasProjects,
  activeChapter,
}: {
  summary: HomepageSummary;
  projects: HomepageProject[];
  hasProjects: boolean;
  activeChapter: number;
}) {
  const workflowActive = activeChapter >= 2;
  const oversightActive = activeChapter >= 3;

  return (
    <div className="hero-console rounded-[1.75rem] border border-white/12 bg-[var(--panel-dark)] p-3 text-white shadow-[0_34px_120px_rgba(16,32,22,0.34)]">
      <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#101711]">
        <div className="border-b border-white/10 bg-white/[0.035] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-white/55">Marketplace console</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Live supply board
              </h2>
            </div>
            <span className="w-fit rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--accent-foreground)]">
              {hasProjects ? "Database live" : "Awaiting listings"}
            </span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <ConsoleMetric label="Credits" value={formatCredits(summary.total_credits)} />
            <ConsoleMetric label="Projects" value={formatCredits(summary.project_count)} />
            <ConsoleMetric label="Regions" value={formatCredits(summary.region_count)} />
            <ConsoleMetric label="Statuses" value={formatCredits(summary.verification_status_count)} />
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:p-6">
          {hasProjects ? (
            projects.slice(0, 3).map((project, index) => (
              <article
                key={`${project.project_name}-${project.location}`}
                className={`hero-project-row rounded-2xl border border-white/10 bg-white/[0.06] p-4 ${
                  activeChapter > 0 ? "is-lit" : ""
                }`}
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                      {project.methodology}
                    </p>
                    <h3 className="mt-2 font-semibold text-white">
                      {project.project_name}
                    </h3>
                    <p className="mt-1 text-sm text-white/58">{project.location}</p>
                  </div>
                  <p className="whitespace-nowrap text-sm font-semibold text-white">
                    {formatCredits(project.available_credits)} credits
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-sm text-white/65">
                  <span>{project.verification_status}</span>
                  <span>{formatPrice(project.price_per_credit)}/credit</span>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.05] p-6">
              <p className="text-lg font-semibold">No live projects listed yet.</p>
              <p className="mt-3 text-sm leading-6 text-white/65">
                When a verified seller creates a project listing, this console
                will show project previews and marketplace totals from Supabase.
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-3 border-t border-white/10 bg-white/[0.025] p-5 sm:grid-cols-3 sm:p-6">
          {workflowSteps.map((step, index) => (
            <div
              key={step.label}
              className={`rounded-2xl border p-4 transition ${
                workflowActive && index <= activeChapter - 1
                  ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "border-white/10 bg-white/[0.04] text-white/68"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                {step.label}
              </p>
              <p className="mt-2 text-sm font-semibold">{step.title}</p>
            </div>
          ))}
        </div>

        <div
          className={`hero-oversight grid gap-3 border-t border-white/10 p-5 sm:grid-cols-3 sm:p-6 ${
            oversightActive ? "is-visible" : ""
          }`}
        >
          {["Verification review", "Demand signals", "Operator audit"].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-sm"
            >
              <span className="text-white/70">{item}</span>
              <span className="font-semibold text-[var(--accent)]">Ready</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-3xl font-semibold tracking-tight text-[var(--brand)]">
        {value}
      </p>
      <p className="mt-3 text-sm font-semibold text-[var(--text)]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{detail}</p>
    </div>
  );
}

function RolePanel({
  label,
  title,
  items,
  highlighted = false,
}: {
  label: string;
  title: string;
  items: string[];
  highlighted?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border p-6 ${
        highlighted
          ? "border-[var(--brand)] bg-[var(--surface-positive)]"
          : "border-[var(--border)] bg-[var(--surface)]"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-soft)]">
        {label}
      </p>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--text-heading)]">
        {title}
      </h3>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex gap-3 rounded-lg border border-[var(--border-muted)] bg-[var(--surface-subtle)] p-4 text-sm leading-6 text-[var(--text-muted)]"
          >
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export function HomeLandingExperience({
  summary,
  unavailable,
}: HomeLandingExperienceProps) {
  const [activeChapter, setActiveChapter] = useState(0);
  const stepsRef = useRef<Array<HTMLDivElement | null>>([]);
  const projects = summary.latest_projects;
  const hasProjects = projects.length > 0;
  const active = chapters[activeChapter] ?? chapters[0];

  useEffect(() => {
    const steps = stepsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!steps.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const index = best?.target.getAttribute("data-chapter");
        if (index !== undefined && index !== null) {
          setActiveChapter(Number(index));
        }
      },
      {
        rootMargin: "-38% 0px -38% 0px",
        threshold: [0, 0.35, 0.6, 0.85],
      },
    );

    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);

  function handleChapterClick(index: number) {
    setActiveChapter(index);
    stepsRef.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  const marketStats = useMemo(
    () => [
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
    ],
    [summary],
  );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text)] [--landing-header-height:140px] sm:[--landing-header-height:84px]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface-soft)]/90 shadow-sm backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <Link href="/" className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            <span className="grid size-9 place-items-center rounded-lg bg-[var(--brand)] text-sm font-bold text-[var(--surface)]">
              TT
            </span>
            TeraTrace
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--brand)]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--brand-hover)]"
            >
              Create account
            </Link>
          </div>
        </nav>
      </header>
      <section className="hero-scroll-stage">
        <div className="hero-sticky sticky top-0 overflow-hidden border-b border-[var(--border)] bg-[var(--surface-soft)]">
          <div className="hero-grid-bg absolute inset-0" />

          <div className="hero-stage-content relative z-10 mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-4 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:px-6">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--brand-soft)] shadow-sm">
                {active.eyebrow}
              </p>
              <h1 className="hero-title max-w-4xl text-5xl font-semibold leading-[1.01] tracking-tight text-[var(--text-heading)] md:text-6xl xl:text-7xl">
                {active.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
                {active.body}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="rounded-full bg-[var(--brand)] px-6 py-3 text-center text-sm font-semibold text-[var(--surface)] shadow-sm transition hover:bg-[var(--brand-hover)]"
                >
                  Start as buyer or seller
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-3 text-center text-sm font-semibold text-[var(--brand)] transition hover:border-[var(--brand)]"
                >
                  View existing dashboard
                </Link>
              </div>

              <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-4">
                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.eyebrow}
                    type="button"
                    onClick={() => handleChapterClick(index)}
                    className={`chapter-tab rounded-lg border p-4 text-left ${
                      activeChapter === index
                        ? "border-[var(--brand)] bg-[var(--surface)]"
                        : "border-[var(--border)] bg-[var(--surface)]/70"
                    }`}
                    aria-pressed={activeChapter === index}
                    aria-label={`Show chapter ${index + 1}: ${chapter.eyebrow}`}
                  >
                    <span className="block text-xs font-semibold text-[var(--brand-soft)]">
                      0{index + 1}
                    </span>
                    <span className="mt-2 block text-sm font-semibold text-[var(--text-heading)]">
                      {chapter.proof}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <SupplyConsole
              summary={summary}
              projects={projects}
              hasProjects={hasProjects}
              activeChapter={activeChapter}
            />
          </div>
        </div>

        <div className="hero-scroll-track" aria-hidden="true">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.eyebrow}
              ref={(node) => {
                stepsRef.current[index] = node;
              }}
              data-chapter={index}
              className="hero-scroll-step"
            />
          ))}
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-soft)]">
                Live market snapshot
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text-heading)] md:text-4xl">
                Real values from current marketplace records.
              </h2>
            </div>
            {unavailable ? (
              <p className="rounded-xl bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
                Homepage summary RPC is not available yet. Run the included
                Supabase migration to enable live public metrics.
              </p>
            ) : (
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                Updated directly from seller project listings, then structured
                for high-signal review by buyers and operators.
              </p>
            )}
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {marketStats.map((stat) => (
              <MetricTile key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-6">
          <div className="mb-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-soft)]">
                Try the estimator
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text-heading)] md:text-4xl">
                Explore estimated impact before creating a workspace.
              </h2>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <p className="max-w-2xl text-sm leading-6 text-[var(--text-muted)] lg:text-right">
                Give senior buyers a practical way to test assumptions before
                asking their team to open a marketplace account.
              </p>
              <Link
                href="/estimator"
                className="w-fit rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--brand)]"
              >
                Open full estimator
              </Link>
            </div>
          </div>
          <CarbonEstimator mode="public" />
        </div>
      </section>

      <section className="bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.42fr_1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-soft)]">
                How it works
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text-heading)]">
                One operating layer for supply, demand, and oversight.
              </h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {workflowSteps.map((step, index) => (
                <article
                  key={step.label}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[var(--brand)] px-3 py-1 text-xs font-semibold text-[var(--surface)]">
                      {step.label}
                    </span>
                    <span className="text-sm font-semibold text-[var(--brand-soft)]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-[var(--text-heading)]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                    {step.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface-soft)]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-6">
          <div className="grid gap-5 lg:grid-cols-3">
            {rolePanels.map((panel, index) => (
              <RolePanel key={panel.label} {...panel} highlighted={index === 1} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-16 lg:grid-cols-[1fr_0.42fr] lg:px-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 border-b border-[var(--border-muted)] pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-soft)]">
                Latest public project previews
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-heading)]">
                Marketplace visibility without exposing private account data.
              </h2>
            </div>
            <span className="w-fit rounded-full bg-[var(--surface-positive)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
              {formatCredits(projects.length)} shown
            </span>
          </div>

          {hasProjects ? (
            <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)]">
              {projects.map((project) => (
                <article
                  key={`${project.project_name}-${project.location}-preview`}
                  className="grid gap-4 border-b border-[var(--border)] bg-[var(--surface-subtle)] p-5 last:border-b-0 lg:grid-cols-[1.2fr_0.7fr_0.6fr]"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-soft)]">
                      {project.methodology}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[var(--text-heading)]">
                      {project.project_name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {project.location}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <p className="text-sm text-[var(--text-muted)]">
                      Estimated credits
                      <span className="block text-lg font-semibold text-[var(--text)]">
                        {formatCredits(project.available_credits)}
                      </span>
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      Indicative price
                      <span className="block text-lg font-semibold text-[var(--text)]">
                        {formatPrice(project.price_per_credit)}/credit
                      </span>
                    </p>
                  </div>
                  <span className="h-fit w-fit rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-sm font-semibold text-[var(--text-label)]">
                    {project.verification_status}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] p-6 text-sm leading-6 text-[var(--text-muted)]">
              No live projects listed yet. The homepage will show real project
              previews here after sellers publish listings from their dashboard.
            </div>
          )}
        </div>

        <aside className="rounded-xl bg-[var(--panel-dark)] p-6 text-white md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Create a workspace
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Build a cleaner carbon supply record from day one.
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Start with structured listings, buyer interest, and admin
            visibility before introducing transaction workflows.
          </p>
          <div className="mt-8 space-y-3">
            {["Buyer discovery", "Seller listings", "Admin oversight"].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm"
              >
                <span>{item}</span>
                <span className="text-[var(--accent)]">Included</span>
              </div>
            ))}
          </div>
          <Link
            href="/signup"
            className="accent-cta mt-8 inline-flex rounded-full px-5 py-3 text-sm font-semibold transition"
          >
            Create account
          </Link>
        </aside>
      </section>
    </main>
  );
}
