import Link from "next/link";
import { signUp } from "@/app/auth/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { PasswordField } from "@/app/_components/PasswordField";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Create a Carbon Credit Marketplace Workspace",
  description:
    "Create a TeraTrace workspace for India carbon credit buyers, project sellers, or facilitators to manage credible marketplace activity.",
  path: "/signup",
});

const roleHighlights = [
  {
    role: "Buyer",
    detail: "Review supply, verification status, and purchase intent.",
  },
  {
    role: "Seller",
    detail: "Publish projects and understand active buyer demand.",
  },
  {
    role: "Facilitator",
    detail: "Coordinate credible opportunities after admin verification.",
  },
];

const signupRoles = [
  {
    label: "Buyer",
    value: "buyer",
    description: "Discover credits and register interest.",
  },
  {
    label: "Seller",
    value: "seller",
    description: "List projects and review buyer demand.",
  },
  {
    label: "Facilitator",
    value: "facilitator",
    description: "Match credible opportunities.",
  },
];

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[var(--surface-soft)] px-4 py-8 text-[var(--text)] sm:px-6 lg:grid lg:place-items-center lg:py-10">
      <ThemeToggle className="fixed right-6 top-6 z-50" />

      <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[1.75rem] bg-[var(--surface)] shadow-[var(--card-shadow)] ring-1 ring-[var(--border)] lg:min-h-[720px] lg:grid-cols-[0.88fr_1.12fr]">
        <div className="relative isolate flex min-h-[28rem] flex-col justify-between overflow-hidden bg-[var(--panel-dark)] p-7 text-white sm:p-9 lg:p-10">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_24%_18%,rgba(215,249,111,0.22),transparent_34%),radial-gradient(circle_at_88%_4%,rgba(139,208,155,0.16),transparent_30%)]"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 -z-10 h-56 w-full bg-[linear-gradient(0deg,rgba(139,208,155,0.12),transparent)]"
          />

          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-base font-semibold"
            >
              <span className="grid size-9 place-items-center rounded-full bg-white/10 text-sm ring-1 ring-white/15">
                TT
              </span>
              TeraTrace
            </Link>

            <div className="mt-12 max-w-md">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                Marketplace onboarding
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Create your carbon market workspace.
              </h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-white/70">
                Choose the company role that matches how your team sources,
                lists, or coordinates credible carbon credit opportunities.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <p className="text-sm font-semibold text-white">
                Workspace routing
              </p>
              <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--accent-foreground)]">
                After signup
              </span>
            </div>
            <div className="divide-y divide-white/10">
              {roleHighlights.map((item) => (
                <div
                  className="grid gap-1 py-3 text-sm sm:grid-cols-[7rem_1fr] sm:gap-4"
                  key={item.role}
                >
                  <p className="font-semibold text-white">{item.role}</p>
                  <p className="leading-6 text-white/68">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-2xl">
            <div className="flex flex-col gap-3 border-b border-[var(--border-muted)] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--brand)]">
                  Secure account setup
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-heading)]">
                  Start with email
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-6 text-[var(--text-muted)]">
                We will send a verification link to your company email using
                the configured SMTP sender.
              </p>
            </div>

            {params.error ? (
              <p className="mt-5 rounded-2xl bg-[var(--danger-bg)] px-4 py-3 text-sm font-medium text-[var(--danger-text)] ring-1 ring-[color-mix(in_srgb,var(--danger-text)_18%,transparent)]">
                {params.error}
              </p>
            ) : null}

            <form action={signUp} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-[var(--text-label)]">
                    Company name
                  </span>
                  <input
                    required
                    name="companyName"
                    className="mt-2 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--brand)_16%,transparent)]"
                    placeholder="Acme Sustainability Ltd."
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[var(--text-label)]">
                    Email
                  </span>
                  <input
                    required
                    name="email"
                    type="email"
                    className="mt-2 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--brand)_16%,transparent)]"
                    placeholder="you@company.com"
                  />
                </label>
              </div>
              <PasswordField showStrength confirm />

              <fieldset>
                <legend className="text-sm font-medium text-[var(--text-label)]">
                  Company role
                </legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                  {signupRoles.map((role) => (
                    <label
                      className="group cursor-pointer rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-subtle)] p-4 has-[:checked]:border-[var(--brand)] has-[:checked]:bg-[var(--surface-positive)] has-[:checked]:shadow-[0_16px_36px_color-mix(in_srgb,var(--brand)_14%,transparent)]"
                      key={role.value}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          defaultChecked={role.value === "buyer"}
                          className="size-4 accent-[var(--brand)]"
                          type="radio"
                          name="role"
                          value={role.value}
                        />
                        <span className="font-semibold text-[var(--text-heading)]">
                          {role.label}
                        </span>
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-[var(--text-muted)]">
                        {role.description}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <PendingButton
                idleLabel="Create account"
                pendingLabel="Creating workspace..."
                className="w-full rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-[var(--surface)] shadow-[0_18px_40px_color-mix(in_srgb,var(--brand)_24%,transparent)] transition hover:bg-[var(--brand-hover)]"
              />
            </form>

            <p className="mt-5 text-center text-sm text-[var(--text-muted)]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[var(--brand)]">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
