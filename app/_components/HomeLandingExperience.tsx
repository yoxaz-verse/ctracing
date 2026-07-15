"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { HomepageProject, HomepageSummary } from "@/app/page";
import { CarbonEstimator } from "@/app/_components/CarbonEstimator";
import { ThemeToggle } from "@/app/_components/ThemeToggle";

type HomeLandingExperienceProps = {
  summary: HomepageSummary;
  unavailable: boolean;
};

const chapters = [
  {
    eyebrow: "Carbon credit marketplace",
    title: "India-first visibility into carbon credit supply.",
    body: "TeraTrace helps carbon credit buyers, project sellers, and facilitators in India understand live supply, demand signals, and verification context from one clean marketplace layer.",
    proof: "Clear India carbon marketplace context before role-specific workflows begin.",
  },
  {
    eyebrow: "For project sellers",
    title: "Publish credible carbon credit supply.",
    body: "Project developers can present methodology, location, available credits, price guidance, and verification progress in a structured marketplace view.",
    proof: "Seller-ready supply records with clear project signals.",
  },
  {
    eyebrow: "For credit buyers",
    title: "Compare supply before making a move.",
    body: "Sustainability teams can review live listings, compare regions and verification status, and record purchase interest before a transaction workflow begins.",
    proof: "Buyer discovery with cleaner diligence context.",
  },
  {
    eyebrow: "For carbon credit facilitators",
    title: "Match buyers and sellers with confidence.",
    body: "Carbon credit facilitators can identify credible supply, qualify buyer interest, and coordinate introductions that create value for both sides.",
    proof: "Facilitator workflows for market connections.",
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
    label: "Facilitator",
    title: "Match credible opportunities",
    detail:
      "Carbon credit facilitators qualify buyer interest, identify seller fit, and coordinate introductions that can turn into market opportunities.",
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
      "Submit project documentation for verification review.",
      "Review demand signals tied to seller-owned projects.",
    ],
  },
  {
    label: "For facilitators",
    title: "Turn market access into qualified introductions.",
    items: [
      "Identify buyer demand and seller supply that fit each other.",
      "Coordinate introductions with project, status, and volume context.",
      "Build a benefit-driven pipeline from credible carbon credit matches.",
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

const carbonBubbles = [
  { x: 8, y: 76, size: 9, delay: -0.8, duration: 12.5, drift: 56 },
  { x: 18, y: 88, size: 5, delay: -6.4, duration: 11.2, drift: 42 },
  { x: 29, y: 72, size: 7, delay: -3.1, duration: 13.8, drift: 68 },
  { x: 41, y: 92, size: 4, delay: -8.3, duration: 10.6, drift: 50 },
  { x: 54, y: 79, size: 8, delay: -1.7, duration: 14.4, drift: 74 },
  { x: 66, y: 86, size: 6, delay: -5.2, duration: 12.1, drift: 46 },
  { x: 78, y: 73, size: 10, delay: -9.6, duration: 15.2, drift: 62 },
  { x: 89, y: 91, size: 5, delay: -2.6, duration: 11.7, drift: 58 },
  { x: 12, y: 58, size: 4, delay: -10.8, duration: 13.1, drift: 36 },
  { x: 35, y: 64, size: 6, delay: -4.7, duration: 12.8, drift: 54 },
  { x: 61, y: 61, size: 4, delay: -7.5, duration: 10.9, drift: 44 },
  { x: 83, y: 55, size: 7, delay: -12.2, duration: 14.9, drift: 64 },
];

function CarbonBubbleField({ variant = "panel" }: { variant?: "hero" | "panel" }) {
  return (
    <div
      aria-hidden="true"
      className={`carbon-bubble-field carbon-bubble-field--${variant}`}
    >
      <div className="carbon-bubble-capture" />
      {carbonBubbles.map((bubble) => (
        <span
          key={`${bubble.x}-${bubble.y}-${bubble.size}`}
          className="carbon-bubble"
          style={
            {
              "--bubble-x": `${bubble.x}%`,
              "--bubble-y": `${bubble.y}%`,
              "--bubble-size": `${bubble.size}px`,
              "--bubble-delay": `${bubble.delay}s`,
              "--bubble-duration": `${bubble.duration}s`,
              "--bubble-drift": `${bubble.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function HeroEcoBackground() {
  return (
    <div className="hero-eco-bg absolute inset-0" aria-hidden="true">
      <span className="hero-eco-bg__canopy hero-eco-bg__canopy--one" />
      <span className="hero-eco-bg__canopy hero-eco-bg__canopy--two" />
      <span className="hero-eco-bg__leaf hero-eco-bg__leaf--one" />
      <span className="hero-eco-bg__leaf hero-eco-bg__leaf--two" />
      <span className="hero-eco-bg__leaf hero-eco-bg__leaf--three" />
    </div>
  );
}

function HeroForestEstimator() {
  return (
    <>
      <div className="hero-forest-estimator">
        <div className="hero-forest-estimator__header">
          <span>Carbon predictor</span>
          <strong>Forest project outlook</strong>
        </div>
        <div className="hero-forest-estimator__land">
          <span className="hero-forest-estimator__parcel" />
          <span className="hero-forest-estimator__stream" />
          <span className="hero-forest-estimator__tree hero-forest-estimator__tree--one" />
          <span className="hero-forest-estimator__tree hero-forest-estimator__tree--two" />
          <span className="hero-forest-estimator__tree hero-forest-estimator__tree--three" />
          <span className="hero-forest-estimator__tree hero-forest-estimator__tree--four" />
          <span className="hero-forest-estimator__tree hero-forest-estimator__tree--five" />
          <span className="hero-forest-estimator__tree hero-forest-estimator__tree--six" />
          <span className="hero-forest-estimator__tree hero-forest-estimator__tree--seven" />
          <span className="hero-forest-estimator__tree hero-forest-estimator__tree--eight" />
          <span className="hero-forest-estimator__marker">ARR</span>
        </div>
        <div className="hero-forest-estimator__flow">
          <span />
          <span />
          <span />
        </div>
        <div className="hero-forest-estimator__metrics">
          <div>
            <span>Area</span>
            <strong>124 ha</strong>
          </div>
          <div>
            <span>Projected credits</span>
            <strong>7.4k</strong>
          </div>
          <div>
            <span>Verification path</span>
            <strong>Ready</strong>
          </div>
        </div>
      </div>
      <div className="hero-scroll-cue">
        <span className="hero-scroll-cue__line" />
        <span className="hero-scroll-cue__pulse" />
      </div>
    </>
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
  const activeWorkflowStep = Math.max(0, activeChapter - 1);

  return (
    <div className="hero-console relative isolate rounded-[1.75rem] border border-white/12 bg-[var(--panel-dark)] p-3 text-white shadow-[0_34px_120px_rgba(16,32,22,0.34)]">
      <div className="relative isolate overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#101711]">
        <CarbonBubbleField />
        <div className="relative z-10">
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
                activeWorkflowStep === index
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
          className="hero-market-signals is-visible grid gap-3 border-t border-white/10 p-5 sm:grid-cols-3 sm:p-6"
        >
          {["Verification review", "Demand signals", "Match pipeline"].map((item) => (
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

function shouldIgnoreKeyboardNavigation(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable="true"], [contenteditable=""], [role="textbox"], [role="combobox"], [role="listbox"], [role="slider"]',
    ),
  );
}

const keyboardSectionCount = 5;

export function HomeLandingExperience({
  summary,
  unavailable,
}: HomeLandingExperienceProps) {
  const [activeChapter, setActiveChapter] = useState(0);
  const [displayChapter, setDisplayChapter] = useState(0);
  const [copyVisible, setCopyVisible] = useState(true);
  const heroStageRef = useRef<HTMLElement | null>(null);
  const stepsRef = useRef<Array<HTMLDivElement | null>>([]);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const scrollTargetRef = useRef<number | null>(null);
  const scrollLockUntilRef = useRef(0);
  const keyboardNavigationActiveRef = useRef(false);
  const keyboardTargetIndexRef = useRef(0);
  const projects = summary.latest_projects;
  const hasProjects = projects.length > 0;
  const active = chapters[displayChapter] ?? chapters[0];
  const showConsole = activeChapter > 0;

  const getScrollBehavior = useCallback((): ScrollBehavior => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
  }, []);

  const getCurrentKeyboardTargetIndex = useCallback(() => {
    const headerHeight =
      document.querySelector(".landing-header")?.getBoundingClientRect().height ?? 0;
    const heroRect = heroStageRef.current?.getBoundingClientRect();
    const firstSectionRect = sectionRefs.current[0]?.getBoundingClientRect();
    const firstSectionHasReachedHeader =
      firstSectionRect &&
      firstSectionRect.top <= Math.max(headerHeight + 24, window.innerHeight * 0.18);

    if (
      heroRect &&
      !firstSectionHasReachedHeader &&
      heroRect.top <= headerHeight + 4 &&
      heroRect.bottom > headerHeight + 4
    ) {
      return activeChapter;
    }

    const sectionTargetLine = headerHeight + 8;
    const bestSection = sectionRefs.current.reduce(
      (current, section, index) => {
        if (!section) {
          return current;
        }

        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top - sectionTargetLine);

        return distance < current.distance ? { index, distance } : current;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    );

    return chapters.length + bestSection.index;
  }, [activeChapter]);

  const scrollToKeyboardTarget = useCallback((index: number) => {
    const targetCount = chapters.length + keyboardSectionCount;
    const targetIndex = Math.min(Math.max(index, 0), targetCount - 1);
    const behavior = getScrollBehavior();
    const now = window.performance.now();
    const lockDuration = behavior === "smooth" ? 760 : 180;

    keyboardNavigationActiveRef.current = true;
    keyboardTargetIndexRef.current = targetIndex;

    if (targetIndex < chapters.length) {
      scrollTargetRef.current = targetIndex;
      scrollLockUntilRef.current = now + lockDuration;
      setActiveChapter(targetIndex);

      stepsRef.current[targetIndex]?.scrollIntoView({
        behavior,
        block: "center",
      });
      return;
    }

    sectionRefs.current[targetIndex - chapters.length]?.scrollIntoView({
      behavior,
      block: "start",
    });
  }, [getScrollBehavior]);

  useEffect(() => {
    let frame = 0;

    function updateActiveChapter() {
      frame = 0;

      if (
        scrollTargetRef.current !== null &&
        window.performance.now() < scrollLockUntilRef.current
      ) {
        setActiveChapter(scrollTargetRef.current);
        return;
      }

      scrollTargetRef.current = null;
      const steps = stepsRef.current.filter(Boolean) as HTMLDivElement[];
      if (!steps.length) {
        return;
      }

      const targetLine = window.innerHeight * 0.52;
      const best = steps.reduce(
        (current, step, index) => {
          const rect = step.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const distance = Math.abs(center - targetLine);

          return distance < current.distance ? { index, distance } : current;
        },
        { index: 0, distance: Number.POSITIVE_INFINITY },
      );

      setActiveChapter((current) => (current === best.index ? current : best.index));
    }

    function requestUpdate() {
      if (frame === 0) {
        frame = window.requestAnimationFrame(updateActiveChapter);
      }
    }

    updateActiveChapter();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  useEffect(() => {
    if (displayChapter === activeChapter) {
      return;
    }

    const hideTimer = window.setTimeout(() => setCopyVisible(false), 0);
    const swapTimer = window.setTimeout(() => {
      setDisplayChapter(activeChapter);
      window.requestAnimationFrame(() => setCopyVisible(true));
    }, 180);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(swapTimer);
    };
  }, [activeChapter, displayChapter]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key !== "ArrowDown" &&
        event.key !== "PageDown" &&
        event.key !== "ArrowUp" &&
        event.key !== "PageUp"
      ) {
        return;
      }

      if (event.repeat) {
        event.preventDefault();
        return;
      }

      if (shouldIgnoreKeyboardNavigation(event.target)) {
        return;
      }

      const direction =
        event.key === "ArrowDown" || event.key === "PageDown" ? 1 : -1;
      const currentTargetIndex = keyboardNavigationActiveRef.current
        ? keyboardTargetIndexRef.current
        : getCurrentKeyboardTargetIndex();
      const targetCount = chapters.length + keyboardSectionCount;
      const nextTargetIndex = Math.min(
        Math.max(currentTargetIndex + direction, 0),
        targetCount - 1,
      );

      if (nextTargetIndex === currentTargetIndex) {
        return;
      }

      event.preventDefault();
      scrollToKeyboardTarget(nextTargetIndex);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [getCurrentKeyboardTargetIndex, scrollToKeyboardTarget]);

  useEffect(() => {
    function resetKeyboardNavigationState() {
      keyboardNavigationActiveRef.current = false;
    }

    window.addEventListener("wheel", resetKeyboardNavigationState, { passive: true });
    window.addEventListener("touchstart", resetKeyboardNavigationState, {
      passive: true,
    });
    window.addEventListener("pointerdown", resetKeyboardNavigationState);

    return () => {
      window.removeEventListener("wheel", resetKeyboardNavigationState);
      window.removeEventListener("touchstart", resetKeyboardNavigationState);
      window.removeEventListener("pointerdown", resetKeyboardNavigationState);
    };
  }, []);

  function handleChapterClick(index: number) {
    keyboardNavigationActiveRef.current = true;
    keyboardTargetIndexRef.current = index;
    scrollTargetRef.current = index;
    scrollLockUntilRef.current = window.performance.now() + 700;
    setActiveChapter(index);

    const target = stepsRef.current[index];
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
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
    <main className="min-h-screen bg-[var(--background)] text-[var(--text)] [--landing-header-height:132px] sm:[--landing-header-height:84px]">
      <header className="landing-header sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface-soft)]/90 shadow-sm backdrop-blur-md">
        <nav className="landing-nav mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <Link href="/" className="landing-brand flex items-center gap-3 text-xl font-semibold tracking-tight">
            <span className="grid size-9 place-items-center rounded-lg bg-[var(--brand)] text-sm font-bold text-[var(--surface)]">
              TT
            </span>
            TeraTrace
          </Link>
          <div className="landing-actions flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="landing-action rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--brand)]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="landing-action rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--brand-hover)]"
            >
              Create account
            </Link>
          </div>
        </nav>
      </header>
      <section ref={heroStageRef} className="hero-scroll-stage">
        <div className="hero-sticky sticky top-0 overflow-hidden border-b border-[var(--border)] bg-[var(--surface-soft)]">
          <HeroEcoBackground />
          <CarbonBubbleField variant="hero" />

          <div
            className={`hero-stage-content ${
              showConsole
                ? "hero-stage-content--with-console"
                : "hero-stage-content--intro"
            } relative z-10 mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-4 lg:items-center lg:px-6`}
          >
            <div className="max-w-3xl">
              <div className={`hero-copy-panel ${copyVisible ? "is-visible" : ""}`}>
                <p className="mb-5 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--brand-soft)] shadow-sm">
                  {active.eyebrow}
                </p>
                <h1
                  className="hero-title max-w-4xl text-5xl font-semibold leading-[1.01] tracking-tight text-[var(--text-heading)] md:text-6xl xl:text-7xl"
                >
                  {active.title}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
                  {active.body}
                </p>
              </div>
              <div className="hero-cta-row mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="hero-cta rounded-full bg-[var(--brand)] px-6 py-3 text-center text-sm font-semibold text-[var(--surface)] shadow-sm transition hover:bg-[var(--brand-hover)]"
                >
                  Start as buyer or seller
                </Link>
                <Link
                  href="/login"
                  className="hero-cta rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-3 text-center text-sm font-semibold text-[var(--brand)] transition hover:border-[var(--brand)]"
                >
                  View existing dashboard
                </Link>
              </div>

              <div className="chapter-progress mt-9 flex max-w-xl gap-2" aria-label="Homepage story chapters">
                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.eyebrow}
                    type="button"
                    onClick={() => handleChapterClick(index)}
                    className={`chapter-tab flex-1 rounded-full border px-3 py-2 text-center text-xs font-semibold ${
                      activeChapter === index
                        ? "border-[var(--brand)] bg-[var(--surface)] text-[var(--brand)]"
                        : "border-[var(--border)] bg-[var(--surface)]/70 text-[var(--text-muted)]"
                    }`}
                    aria-pressed={activeChapter === index}
                    aria-label={`Show chapter ${index + 1}: ${chapter.eyebrow}`}
                  >
                    <span className="block">0{index + 1}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="hero-visual-stack" aria-hidden="true">
              <div
                className={`hero-visual-layer ${
                  showConsole
                    ? "hero-visual-layer--inactive"
                    : "hero-visual-layer--active"
                }`}
              >
                <HeroForestEstimator />
              </div>
              <div
                className={`hero-visual-layer hero-console-shell ${
                  showConsole
                    ? "hero-visual-layer--active hero-console-shell--visible"
                    : "hero-visual-layer--inactive hero-console-shell--hidden"
                }`}
              >
                <SupplyConsole
                  summary={summary}
                  projects={projects}
                  hasProjects={hasProjects}
                  activeChapter={activeChapter}
                />
              </div>
            </div>
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

      <section
        ref={(node) => {
          sectionRefs.current[0] = node;
        }}
        className="keyboard-scroll-target border-b border-[var(--border)] bg-[var(--background)]"
      >
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
                Updated directly from seller project listings in the carbon
                credit marketplace, then structured for high-signal review by
                buyers and facilitators in India.
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

      <section
        ref={(node) => {
          sectionRefs.current[1] = node;
        }}
        className="keyboard-scroll-target border-b border-[var(--border)] bg-[var(--surface-soft)]"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-6">
          <div className="mb-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-soft)]">
                Try the estimator
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text-heading)] md:text-4xl">
                Explore estimated impact before creating an India carbon
                marketplace workspace.
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
                Open carbon credit estimator
              </Link>
            </div>
          </div>
          <CarbonEstimator mode="public" />
        </div>
      </section>

      <section
        ref={(node) => {
          sectionRefs.current[2] = node;
        }}
        className="keyboard-scroll-target bg-[var(--surface)]"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.42fr_1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-soft)]">
                How it works
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text-heading)]">
                One carbon marketplace layer for India sellers, buyers, and
                facilitators.
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

      <section
        ref={(node) => {
          sectionRefs.current[3] = node;
        }}
        className="keyboard-scroll-target border-y border-[var(--border)] bg-[var(--surface-soft)]"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-6">
          <div className="grid gap-5 lg:grid-cols-3">
            {rolePanels.map((panel, index) => (
              <RolePanel key={panel.label} {...panel} highlighted={index === 1} />
            ))}
          </div>
        </div>
      </section>

      <section
        ref={(node) => {
          sectionRefs.current[4] = node;
        }}
        className="keyboard-scroll-target mx-auto grid max-w-7xl gap-6 px-5 py-16 lg:grid-cols-[1fr_0.42fr] lg:px-6"
      >
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

        <aside className="relative isolate overflow-hidden rounded-xl bg-[var(--panel-dark)] p-6 text-white md:p-8">
          <CarbonBubbleField />
          <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Create a workspace
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Build a cleaner carbon supply record from day one.
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Start with structured listings, buyer interest, and facilitator
            matching before introducing transaction workflows.
          </p>
          <div className="mt-8 space-y-3">
            {["Buyer discovery", "Seller listings", "Facilitator matching"].map((item) => (
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
          </div>
        </aside>
      </section>
    </main>
  );
}
