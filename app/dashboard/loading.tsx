export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#f5f7f3] text-[#17201b]">
      <header className="border-b border-[#d8ded2] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="loading-shimmer h-6 w-32 rounded-full bg-[#e5ebe1]" />
            <div className="loading-shimmer mt-2 h-4 w-48 rounded-full bg-[#edf2ea]" />
          </div>
          <div className="hidden gap-3 md:flex">
            <div className="loading-shimmer h-10 w-36 rounded-full bg-[#edf2ea]" />
            <div className="loading-shimmer h-10 w-36 rounded-full bg-[#edf2ea]" />
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.38fr]">
          <div>
            <div className="loading-shimmer h-4 w-44 rounded-full bg-[#e5ebe1]" />
            <div className="loading-shimmer mt-4 h-12 w-10/12 rounded-2xl bg-[#e5ebe1]" />
            <div className="loading-shimmer mt-3 h-12 w-8/12 rounded-2xl bg-[#e5ebe1]" />
          </div>
          <div className="loading-shimmer h-36 rounded-3xl bg-[#dfe8da]" />
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
