import Link from "next/link";

const marketStats = [
  { label: "Indicative credits listed", value: "184k tCO2e" },
  { label: "Project regions", value: "12" },
  { label: "Verification stages", value: "4" },
];

const projects = [
  {
    name: "Western Ghats Afforestation Corridor",
    type: "Afforestation",
    location: "Karnataka, India",
    volume: "24,000 credits",
    status: "Documentation review",
  },
  {
    name: "Agroforestry Transition Cluster",
    type: "Nature-based removal",
    location: "Tamil Nadu, India",
    volume: "16,500 credits",
    status: "Registry pending",
  },
  {
    name: "Community Mangrove Restoration",
    type: "Blue carbon",
    location: "Odisha, India",
    volume: "11,200 credits",
    status: "Verified supply",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f7f3] text-[#17201b]">
      <section className="border-b border-[#d8ded2] bg-[#eef3ec]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            TeraTrace
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-[#b7c2b1] px-4 py-2 text-sm font-medium text-[#263a2e] transition hover:border-[#214d35]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#214d35] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#183b28]"
            >
              Create account
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:pb-20">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#c8d2c2] bg-white/70 px-4 py-2 text-sm font-medium text-[#45624f]">
              Carbon credit marketplace foundation
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-[#142019] md:text-7xl">
              Traceable carbon supply for buyers and project developers.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#526158]">
              TeraTrace gives sustainability teams a clean path to discover
              carbon credit projects, review estimated impact, and coordinate
              with sellers before any transaction workflow is introduced.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-[#214d35] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#183b28]"
              >
                Start as buyer or seller
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-[#b7c2b1] px-6 py-3 text-center text-sm font-semibold text-[#214d35] transition hover:border-[#214d35]"
              >
                View existing dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d5ddd0] bg-white p-4 shadow-[0_24px_80px_rgba(26,45,33,0.12)]">
            <div className="rounded-[1.5rem] bg-[#17201b] p-5 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm text-white/60">Marketplace signal</p>
                  <h2 className="text-2xl font-semibold">Live supply board</h2>
                </div>
                <span className="rounded-full bg-[#d7f96f] px-3 py-1 text-xs font-semibold text-[#17201b]">
                  Sample data
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {projects.map((project) => (
                  <article
                    key={project.name}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#d7f96f]">
                          {project.type}
                        </p>
                        <h3 className="mt-2 font-semibold">{project.name}</h3>
                        <p className="mt-1 text-sm text-white/60">
                          {project.location}
                        </p>
                      </div>
                      <p className="whitespace-nowrap text-sm font-semibold">
                        {project.volume}
                      </p>
                    </div>
                    <p className="mt-3 text-sm text-white/70">
                      {project.status}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-3">
        {marketStats.map((stat) => (
          <div
            key={stat.label}
            className="border-b border-[#c9d3c4] pb-6 md:border-b-0 md:border-l md:pl-6"
          >
            <p className="text-3xl font-semibold text-[#214d35]">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-[#5b6a61]">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-20 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-[#dfe5dc]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
            For buyers
          </p>
          <h2 className="mt-4 text-3xl font-semibold">
            Compare potential supply with the context your team needs.
          </h2>
          <p className="mt-4 leading-7 text-[#5b6a61]">
            Explore listed projects, view available credit estimates, review
            verification status, and create purchase-interest records for later
            follow-up.
          </p>
        </div>
        <div className="rounded-3xl bg-[#e3eadf] p-8 ring-1 ring-[#ccd8c6]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
            For sellers
          </p>
          <h2 className="mt-4 text-3xl font-semibold">
            Present project inventory without over-claiming readiness.
          </h2>
          <p className="mt-4 leading-7 text-[#5b6a61]">
            Manage project listings, communicate documentation progress, and
            see buyer interest while verification and registry work continues.
          </p>
        </div>
      </section>
    </main>
  );
}
