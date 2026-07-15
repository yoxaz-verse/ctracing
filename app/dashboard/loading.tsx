import { CarbonCreditLoader } from "@/app/_components/AppLoading";

function Skeleton({
  className,
  label,
}: {
  className: string;
  label?: string;
}) {
  return (
    <div
      className={`loading-shimmer ${className}`}
      aria-hidden={label ? undefined : "true"}
      aria-label={label}
    />
  );
}

function MetricSkeleton() {
  return (
    <article className="rounded-2xl bg-[var(--surface)] p-5 shadow-sm ring-1 ring-[var(--border-muted)] md:rounded-3xl md:p-6">
      <Skeleton className="h-3 w-24 rounded-full bg-[var(--surface-muted)]" />
      <Skeleton className="mt-4 h-8 w-28 rounded-full bg-[var(--surface-positive)]" />
      <Skeleton className="mt-4 h-3 w-full rounded-full bg-[var(--surface-subtle)]" />
      <Skeleton className="mt-2 h-3 w-9/12 rounded-full bg-[var(--surface-subtle)]" />
    </article>
  );
}

function TableRowSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid grid-cols-[1.2fr_0.75fr_0.55fr] items-center gap-4 border-t border-[var(--border-muted)] py-4">
      <div>
        <Skeleton className="h-4 w-11/12 rounded-full bg-[var(--surface-muted)]" />
        <Skeleton className="mt-2 h-3 w-7/12 rounded-full bg-[var(--surface-subtle)]" />
      </div>
      <Skeleton className="h-4 w-10/12 rounded-full bg-[var(--surface-subtle)]" />
      <Skeleton
        className={`ml-auto rounded-full bg-[var(--surface-positive)] ${compact ? "h-7 w-16" : "h-8 w-20"}`}
      />
    </div>
  );
}

export default function DashboardLoading({
  title = "Loading workspace...",
  subtitle = "Syncing carbon-credit inventory, verification state, and project records.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <main
      className="dashboard-loading-dark min-h-screen bg-[var(--background)] text-[var(--text)]"
      aria-busy="true"
    >
      <header className="hidden border-b border-[var(--border)] bg-[var(--surface)] md:block">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-semibold text-[var(--brand)]">TeraTrace</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Skeleton className="h-7 w-36 rounded-full bg-[var(--surface-positive)]" />
              <Skeleton className="h-4 w-44 rounded-full bg-[var(--surface-subtle)]" />
              <Skeleton className="h-7 w-32 rounded-full bg-[var(--surface-muted)]" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-[var(--surface-subtle)]" />
            <Skeleton className="h-10 w-24 rounded-full bg-[var(--surface-positive)]" />
            <Skeleton className="h-10 w-24 rounded-full bg-[var(--surface-subtle)]" />
          </div>
        </div>
      </header>
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] shadow-sm backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold leading-tight text-[var(--brand)]">
              TeraTrace
            </p>
            <Skeleton className="mt-2 h-3.5 w-40 max-w-full rounded-full bg-[var(--surface-subtle)]" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-10 w-20 rounded-full bg-[var(--surface-subtle)]" />
            <Skeleton className="h-10 w-12 rounded-full bg-[var(--surface-muted)]" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 overflow-hidden">
          <Skeleton className="h-7 w-36 shrink-0 rounded-full bg-[var(--surface-positive)]" />
          <Skeleton className="h-7 w-32 shrink-0 rounded-full bg-[var(--surface-muted)]" />
        </div>
      </header>
      <div className="hidden border-b border-[var(--border)] bg-[var(--surface-soft)] md:block">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-hidden px-6 py-3">
          <Skeleton className="h-10 w-24 shrink-0 rounded-full bg-[var(--surface)]" />
          <Skeleton className="h-10 w-24 shrink-0 rounded-full bg-[var(--surface)]" />
          <Skeleton className="h-10 w-28 shrink-0 rounded-full bg-[var(--surface)]" />
          <Skeleton className="h-10 w-24 shrink-0 rounded-full bg-[var(--surface)]" />
          <Skeleton className="h-10 w-28 shrink-0 rounded-full bg-[var(--surface)]" />
        </div>
      </div>
      <section
        className="mx-auto max-w-7xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-5 md:px-6 md:py-8"
        role="status"
        aria-live="polite"
        aria-label={title}
      >
        <span className="sr-only">{title}</span>
        <div className="grid gap-6 lg:grid-cols-[1fr_0.36fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-soft)]">
              Workspace loading
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight md:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-[var(--text-muted)]">{subtitle}</p>
          </div>
          <div className="rounded-2xl bg-[var(--surface)] p-5 shadow-sm ring-1 ring-[var(--border-muted)] md:rounded-3xl">
            <div className="flex items-center gap-4">
              <CarbonCreditLoader compact />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-soft)]">
                  Registry sync
                </p>
                <div className="carbon-flow mt-3 space-y-2">
                  <Skeleton className="carbon-flow__line h-2.5 w-full rounded-full bg-[var(--surface-subtle)]" />
                  <Skeleton className="carbon-flow__line h-2.5 w-9/12 rounded-full bg-[var(--surface-subtle)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-3">
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.78fr_0.42fr]">
          <div className="space-y-6">
            <section className="rounded-2xl bg-[var(--surface)] p-5 shadow-sm ring-1 ring-[var(--border-muted)] md:rounded-3xl md:p-6">
              <div className="border-b border-[var(--border-muted)] pb-5">
                <Skeleton className="h-7 w-48 rounded-full bg-[var(--surface-muted)]" />
                <Skeleton className="mt-3 h-4 w-10/12 rounded-full bg-[var(--surface-subtle)]" />
              </div>
              <div className="mt-1">
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton compact />
              </div>
            </section>

            <section className="rounded-2xl bg-[var(--surface)] p-5 shadow-sm ring-1 ring-[var(--border-muted)] md:rounded-3xl md:p-6">
              <Skeleton className="h-7 w-52 rounded-full bg-[var(--surface-muted)]" />
              <Skeleton className="mt-3 h-4 w-8/12 rounded-full bg-[var(--surface-subtle)]" />
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Skeleton className="h-12 rounded-2xl bg-[var(--surface-subtle)]" />
                <Skeleton className="h-12 rounded-2xl bg-[var(--surface-subtle)]" />
                <Skeleton className="h-12 rounded-2xl bg-[var(--surface-subtle)]" />
                <Skeleton className="h-12 rounded-2xl bg-[var(--surface-subtle)]" />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl bg-[var(--panel-dark)] p-5 text-[var(--foreground)] shadow-sm md:rounded-3xl md:p-6">
              <div className="flex items-center gap-4">
                <CarbonCreditLoader compact />
                <div className="flex-1">
                  <Skeleton className="h-3 w-20 rounded-full bg-white/20" />
                  <Skeleton className="mt-4 h-7 w-36 rounded-full bg-white/28" />
                </div>
              </div>
              <Skeleton className="mt-6 h-3 w-full rounded-full bg-white/18" />
              <Skeleton className="mt-2 h-3 w-9/12 rounded-full bg-white/18" />
            </section>

            <section className="rounded-2xl bg-[var(--surface)] p-5 shadow-sm ring-1 ring-[var(--border-muted)] md:rounded-3xl md:p-6">
              <Skeleton className="h-6 w-40 rounded-full bg-[var(--surface-muted)]" />
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-28 rounded-full bg-[var(--surface-subtle)]" />
                  <Skeleton className="h-8 w-16 rounded-full bg-[var(--surface-positive)]" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-32 rounded-full bg-[var(--surface-subtle)]" />
                  <Skeleton className="h-8 w-16 rounded-full bg-[var(--surface-muted)]" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-24 rounded-full bg-[var(--surface-subtle)]" />
                  <Skeleton className="h-8 w-16 rounded-full bg-[var(--surface-positive)]" />
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
      <div className="dashboard-mobile-tabs fixed inset-x-0 bottom-0 z-40 flex gap-2 overflow-hidden border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-3 pb-[calc(0.7rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-18px_40px_rgba(23,32,27,0.12)] backdrop-blur-xl md:hidden">
        <Skeleton className="h-[3.55rem] min-w-[4.7rem] flex-1 rounded-2xl bg-[var(--surface-positive)]" />
        <Skeleton className="h-[3.55rem] min-w-[4.7rem] flex-1 rounded-2xl bg-[var(--surface-subtle)]" />
        <Skeleton className="h-[3.55rem] min-w-[4.7rem] flex-1 rounded-2xl bg-[var(--surface-subtle)]" />
        <Skeleton className="h-[3.55rem] min-w-[4.7rem] flex-1 rounded-2xl bg-[var(--surface-subtle)]" />
      </div>
    </main>
  );
}
