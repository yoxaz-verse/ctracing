import { CarbonCreditLoader } from "@/app/_components/AppLoading";

export default function DashboardLoading({
  title = "Loading workspace...",
  subtitle = "Syncing carbon-credit inventory, verification state, and project records.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7f3] text-[#17201b]">
      <header className="border-b border-[#d8ded2] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="loading-shimmer h-6 w-32 rounded-full bg-[#e5ebe1]" />
            <div className="loading-shimmer mt-2 h-4 w-48 rounded-full bg-[#edf2ea]" />
          </div>
          <div className="flex gap-3">
            <div className="loading-shimmer h-10 w-28 rounded-full bg-[#edf2ea]" />
            <div className="loading-shimmer h-10 w-24 rounded-full bg-[#edf2ea]" />
          </div>
        </div>
      </header>
      <div className="border-b border-[#d8ded2] bg-[#f5f7f3]">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-hidden px-6 py-3">
          <div className="loading-shimmer h-10 w-24 rounded-full bg-white" />
          <div className="loading-shimmer h-10 w-24 rounded-full bg-white" />
          <div className="loading-shimmer h-10 w-24 rounded-full bg-white" />
        </div>
      </div>
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
          <div className="flex items-center gap-4">
            <CarbonCreditLoader compact />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
                Carbon ledger loading
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {title}
              </h1>
              <p className="mt-1 text-sm text-[#5b6a61]">{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="loading-shimmer h-36 rounded-3xl bg-white" />
          <div className="loading-shimmer h-36 rounded-3xl bg-white" />
          <div className="loading-shimmer h-36 rounded-3xl bg-white" />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.45fr]">
          <div className="loading-shimmer h-[28rem] rounded-3xl bg-white" />
          <div className="space-y-6">
            <div className="loading-shimmer h-56 rounded-3xl bg-[#e3eadf]" />
            <div className="loading-shimmer h-48 rounded-3xl bg-white" />
          </div>
        </div>
      </section>
    </main>
  );
}
