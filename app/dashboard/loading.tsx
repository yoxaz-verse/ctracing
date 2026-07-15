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
    <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
      <Skeleton className="h-3 w-24 rounded-full bg-[#e1e9de]" />
      <Skeleton className="mt-4 h-8 w-28 rounded-full bg-[#d2ddce]" />
      <Skeleton className="mt-4 h-3 w-full rounded-full bg-[#edf2ea]" />
      <Skeleton className="mt-2 h-3 w-9/12 rounded-full bg-[#edf2ea]" />
    </article>
  );
}

function TableRowSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid grid-cols-[1.2fr_0.75fr_0.55fr] items-center gap-4 border-t border-[#e2e8df] py-4">
      <div>
        <Skeleton className="h-4 w-11/12 rounded-full bg-[#dde6da]" />
        <Skeleton className="mt-2 h-3 w-7/12 rounded-full bg-[#eef2eb]" />
      </div>
      <Skeleton className="h-4 w-10/12 rounded-full bg-[#e5ebe1]" />
      <Skeleton
        className={`ml-auto rounded-full bg-[#e0eadc] ${compact ? "h-7 w-16" : "h-8 w-20"}`}
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
    <main className="min-h-screen bg-[#f5f7f3] text-[#17201b]" aria-busy="true">
      <header className="border-b border-[#d8ded2] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-semibold text-[#214d35]">TeraTrace</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Skeleton className="h-7 w-36 rounded-full bg-[#eef6ed]" />
              <Skeleton className="h-4 w-44 rounded-full bg-[#edf2ea]" />
              <Skeleton className="h-7 w-32 rounded-full bg-[#e3eadf]" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-[#edf2ea]" />
            <Skeleton className="h-10 w-24 rounded-full bg-[#214d35]/15" />
            <Skeleton className="h-10 w-24 rounded-full bg-[#edf2ea]" />
          </div>
        </div>
      </header>
      <div className="border-b border-[#d8ded2] bg-[#f5f7f3]">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-hidden px-6 py-3">
          <Skeleton className="h-10 w-24 shrink-0 rounded-full bg-white" />
          <Skeleton className="h-10 w-24 shrink-0 rounded-full bg-white" />
          <Skeleton className="h-10 w-28 shrink-0 rounded-full bg-white" />
          <Skeleton className="h-10 w-24 shrink-0 rounded-full bg-white" />
          <Skeleton className="h-10 w-28 shrink-0 rounded-full bg-white" />
        </div>
      </div>
      <section
        className="mx-auto max-w-7xl px-6 py-8"
        role="status"
        aria-live="polite"
        aria-label={title}
      >
        <span className="sr-only">{title}</span>
        <div className="grid gap-6 lg:grid-cols-[1fr_0.36fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
              Workspace loading
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight md:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">{subtitle}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#dfe5dc]">
            <div className="flex items-center gap-4">
              <CarbonCreditLoader compact />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#557462]">
                  Registry sync
                </p>
                <div className="carbon-flow mt-3 space-y-2">
                  <Skeleton className="carbon-flow__line h-2.5 w-full rounded-full bg-[#e5ebe1]" />
                  <Skeleton className="carbon-flow__line h-2.5 w-9/12 rounded-full bg-[#e5ebe1]" />
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
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
              <div className="border-b border-[#e2e8df] pb-5">
                <Skeleton className="h-7 w-48 rounded-full bg-[#d9e3d5]" />
                <Skeleton className="mt-3 h-4 w-10/12 rounded-full bg-[#edf2ea]" />
              </div>
              <div className="mt-1">
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton compact />
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
              <Skeleton className="h-7 w-52 rounded-full bg-[#d9e3d5]" />
              <Skeleton className="mt-3 h-4 w-8/12 rounded-full bg-[#edf2ea]" />
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Skeleton className="h-12 rounded-2xl bg-[#f0f4ed]" />
                <Skeleton className="h-12 rounded-2xl bg-[#f0f4ed]" />
                <Skeleton className="h-12 rounded-2xl bg-[#f0f4ed]" />
                <Skeleton className="h-12 rounded-2xl bg-[#f0f4ed]" />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl bg-[#17201b] p-6 text-white shadow-sm">
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

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
              <Skeleton className="h-6 w-40 rounded-full bg-[#d9e3d5]" />
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-28 rounded-full bg-[#e5ebe1]" />
                  <Skeleton className="h-8 w-16 rounded-full bg-[#eef6ed]" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-32 rounded-full bg-[#e5ebe1]" />
                  <Skeleton className="h-8 w-16 rounded-full bg-[#fff7df]" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-24 rounded-full bg-[#e5ebe1]" />
                  <Skeleton className="h-8 w-16 rounded-full bg-[#eef6ed]" />
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
