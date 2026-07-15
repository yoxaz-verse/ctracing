export function CarbonCreditLoader({ compact = false }: { compact?: boolean }) {
  const sizeClass = compact ? "size-12" : "size-20";

  return (
    <div
      className={`carbon-loader relative ${sizeClass} shrink-0 rounded-full`}
      aria-hidden="true"
    >
      <span className="carbon-loader__orbit carbon-loader__orbit--one">
        <span className="carbon-loader__electron" />
      </span>
      <span className="carbon-loader__orbit carbon-loader__orbit--two">
        <span className="carbon-loader__electron" />
      </span>
      <span className="carbon-loader__orbit carbon-loader__orbit--three">
        <span className="carbon-loader__electron" />
      </span>
      <span className="carbon-loader__nucleus absolute inset-0 m-auto grid place-items-center rounded-full text-[0.72rem] font-semibold tracking-tight">
        CO2
      </span>
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
      className="app-loading flex min-h-screen items-center justify-center px-6 py-12"
      aria-busy="true"
    >
      <section
        className="flex w-full max-w-sm flex-col items-center text-center"
        role="status"
        aria-live="polite"
        aria-label={title}
      >
        <span className="sr-only">{title}</span>
        <CarbonCreditLoader />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 max-w-xs text-sm leading-6">{subtitle}</p>
      </section>
    </main>
  );
}
