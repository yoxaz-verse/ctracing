export function CarbonCreditLoader({ compact = false }: { compact?: boolean }) {
  const sizeClass = compact ? "h-14 w-14" : "h-20 w-20";
  const orbitClass = compact ? "inset-1" : "inset-2";

  return (
    <div
      className={`carbon-loader relative ${sizeClass} shrink-0 rounded-[1.35rem] bg-[#214d35] shadow-[0_18px_45px_rgba(33,77,53,0.22)]`}
      aria-hidden="true"
    >
      <span
        className={`carbon-loader__orbit absolute ${orbitClass} rounded-full border border-[#d7f96f]/35`}
      >
        <span className="carbon-loader__credit absolute -right-1 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full bg-[#d7f96f] text-[0.58rem] font-bold text-[#17201b] ring-2 ring-[#214d35]">
          C
        </span>
      </span>
      <span className="carbon-loader__leaf absolute left-1/2 top-[0.52rem] h-5 w-3 -translate-x-1/2 rounded-[999px_999px_999px_2px] bg-[#d7f96f]" />
      <span className="absolute inset-0 grid place-items-center text-[0.8rem] font-semibold tracking-tight text-white">
        CO2
      </span>
      <span className="carbon-loader__pulse absolute inset-[1.15rem] rounded-full border border-white/20" />
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
    <main className="flex min-h-screen items-center justify-center bg-[#eef3ec] px-6 py-12 text-[#17201b]">
      <section className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-[#d8ded2]">
        <div className="flex items-center gap-4">
          <CarbonCreditLoader />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
              Carbon ledger loading
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {title}
            </h1>
          </div>
        </div>
        <p className="mt-5 leading-7 text-[#5b6a61]">{subtitle}</p>
        <div className="mt-7 rounded-2xl border border-[#d8ded2] bg-[#f3f6f0] p-4">
          <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#557462]">
            <span>Credits</span>
            <span>tCO2e</span>
          </div>
          <div className="carbon-flow mt-4 space-y-3">
            <div className="loading-shimmer carbon-flow__line h-3 w-full rounded-full bg-[#e5ebe1]" />
            <div className="loading-shimmer carbon-flow__line h-3 w-10/12 rounded-full bg-[#e5ebe1]" />
            <div className="loading-shimmer carbon-flow__line h-3 w-7/12 rounded-full bg-[#e5ebe1]" />
          </div>
        </div>
      </section>
    </main>
  );
}
