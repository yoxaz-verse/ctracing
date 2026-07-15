export function CarbonCreditLoader({ compact = false }: { compact?: boolean }) {
  const sizeClass = compact ? "h-12 w-12" : "h-[4.5rem] w-[4.5rem]";
  const orbitClass = compact ? "inset-1.5" : "inset-2.5";
  const creditClass = compact ? "h-4 w-4 text-[0.5rem]" : "h-5 w-5 text-[0.58rem]";
  const leafClass = compact ? "top-[0.42rem] h-4 w-2.5" : "top-[0.56rem] h-5 w-3";

  return (
    <div
      className={`carbon-loader relative ${sizeClass} shrink-0 rounded-2xl bg-[#214d35] shadow-[0_14px_32px_rgba(33,77,53,0.18)] ring-1 ring-[#d7f96f]/20`}
      aria-hidden="true"
    >
      <span
        className={`carbon-loader__orbit absolute ${orbitClass} rounded-full border border-[#d7f96f]/35`}
      >
        <span
          className={`carbon-loader__credit absolute -right-1 top-1/2 grid ${creditClass} -translate-y-1/2 place-items-center rounded-full bg-[#d7f96f] font-bold text-[#17201b] ring-2 ring-[#214d35]`}
        >
          C
        </span>
      </span>
      <span
        className={`carbon-loader__leaf absolute left-1/2 ${leafClass} -translate-x-1/2 rounded-[999px_999px_999px_2px] bg-[#d7f96f]`}
      />
      <span className="absolute inset-0 grid place-items-center text-[0.72rem] font-semibold tracking-tight text-white">
        CO2
      </span>
      <span className="carbon-loader__pulse absolute inset-[22%] rounded-full border border-white/20" />
    </div>
  );
}

export function AppLoading({
  title = "Preparing TeraTrace",
  subtitle = "Tracing carbon-credit supply, registry status, and marketplace data.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#eef3ec] px-6 py-12 text-[#17201b]"
      aria-busy="true"
    >
      <section
        className="w-full max-w-3xl"
        role="status"
        aria-live="polite"
        aria-label={title}
      >
        <span className="sr-only">{title}</span>
        <div className="grid gap-6 rounded-[1.75rem] border border-[#d8ded2] bg-white/88 p-6 shadow-sm backdrop-blur sm:p-8 md:grid-cols-[auto_1fr]">
          <CarbonCreditLoader />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#557462]">
              Carbon ledger loading
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-[#5b6a61]">
              {subtitle}
            </p>
          </div>

          <div className="md:col-span-2">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#e0e7dc] bg-[#f7faf4] p-4">
                <div className="loading-shimmer h-3 w-20 rounded-full bg-[#dfe8dc]" />
                <div className="loading-shimmer mt-4 h-7 w-24 rounded-full bg-[#d4dfd0]" />
              </div>
              <div className="rounded-2xl border border-[#e0e7dc] bg-[#f7faf4] p-4">
                <div className="loading-shimmer h-3 w-24 rounded-full bg-[#dfe8dc]" />
                <div className="loading-shimmer mt-4 h-7 w-20 rounded-full bg-[#d4dfd0]" />
              </div>
              <div className="rounded-2xl border border-[#e0e7dc] bg-[#f7faf4] p-4">
                <div className="loading-shimmer h-3 w-16 rounded-full bg-[#dfe8dc]" />
                <div className="loading-shimmer mt-4 h-7 w-28 rounded-full bg-[#d4dfd0]" />
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-[#d8ded2] bg-[#f3f6f0] p-4">
              <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#557462]">
                <span>Registry</span>
                <span>tCO2e</span>
              </div>
              <div className="carbon-flow mt-4 space-y-3">
                <div className="loading-shimmer carbon-flow__line h-3 w-full rounded-full bg-[#e5ebe1]" />
                <div className="loading-shimmer carbon-flow__line h-3 w-10/12 rounded-full bg-[#e5ebe1]" />
                <div className="loading-shimmer carbon-flow__line h-3 w-7/12 rounded-full bg-[#e5ebe1]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
