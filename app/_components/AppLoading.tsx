export function AppLoading({
  title = "Preparing TeraTrace",
  subtitle = "Checking workspace data and loading the next view.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef3ec] px-6 py-12 text-[#17201b]">
      <section className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-[#d8ded2]">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-2xl bg-[#214d35]">
            <span className="absolute inset-3 rounded-full border-2 border-[#d7f96f] border-r-transparent motion-safe:animate-spin" />
            <span className="absolute inset-[1.15rem] rounded-full bg-[#d7f96f]" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
              Loading
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {title}
            </h1>
          </div>
        </div>
        <p className="mt-5 leading-7 text-[#5b6a61]">{subtitle}</p>
        <div className="mt-7 space-y-3">
          <div className="loading-shimmer h-4 w-full rounded-full bg-[#e5ebe1]" />
          <div className="loading-shimmer h-4 w-10/12 rounded-full bg-[#e5ebe1]" />
          <div className="loading-shimmer h-4 w-7/12 rounded-full bg-[#e5ebe1]" />
        </div>
      </section>
    </main>
  );
}
