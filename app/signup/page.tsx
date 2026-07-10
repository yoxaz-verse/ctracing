import Link from "next/link";
import { signUp } from "@/app/auth/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { PasswordField } from "@/app/_components/PasswordField";
import { ThemeToggle } from "@/app/_components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#eef3ec] px-6 py-12">
      <ThemeToggle className="fixed right-6 top-6 z-50" />
      <section className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-[#d8ded2] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-[#17201b] p-8 text-white md:p-10">
          <Link href="/" className="text-lg font-semibold">
            TeraTrace
          </Link>
          <h1 className="mt-10 text-4xl font-semibold tracking-tight">
            Create a carbon market workspace.
          </h1>
          <p className="mt-5 leading-7 text-white/68">
            Select your company role now. The app will route buyers and sellers
            into separate dashboards immediately after signup.
          </p>
          <div className="mt-10 space-y-4 text-sm text-white/72">
            <p className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              Buyers can review estimated supply, verification status, and
              purchase-interest cards.
            </p>
            <p className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              Sellers can manage project listings, visible credits, and buyer
              inquiry signals.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <h2 className="text-3xl font-semibold tracking-tight">
            Start with email
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#5b6a61]">
            TeraTrace will send a verification link to your company email using
            the configured SMTP sender.
          </p>
          {params.error ? (
            <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
              {params.error}
            </p>
          ) : null}

          <form action={signUp} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-[#314239]">
                Company name
              </span>
              <input
                required
                name="companyName"
                className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                placeholder="Acme Sustainability Ltd."
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#314239]">Email</span>
              <input
                required
                name="email"
                type="email"
                className="mt-2 w-full rounded-2xl border border-[#cbd5c5] bg-white px-4 py-3 outline-none transition focus:border-[#214d35]"
                placeholder="you@company.com"
              />
            </label>
            <PasswordField showStrength confirm />

            <fieldset>
              <legend className="text-sm font-medium text-[#314239]">
                Company role
              </legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <label className="cursor-pointer rounded-2xl border border-[#cbd5c5] p-4 has-[:checked]:border-[#214d35] has-[:checked]:bg-[#eef6ed]">
                  <input
                    defaultChecked
                    className="mr-2"
                    type="radio"
                    name="role"
                    value="buyer"
                  />
                  <span className="font-semibold">Buyer</span>
                  <p className="mt-2 text-sm text-[#5b6a61]">
                    Discover credits and register interest.
                  </p>
                </label>
                <label className="cursor-pointer rounded-2xl border border-[#cbd5c5] p-4 has-[:checked]:border-[#214d35] has-[:checked]:bg-[#eef6ed]">
                  <input
                    className="mr-2"
                    type="radio"
                    name="role"
                    value="seller"
                  />
                  <span className="font-semibold">Seller</span>
                  <p className="mt-2 text-sm text-[#5b6a61]">
                    List projects and review buyer demand.
                  </p>
                </label>
              </div>
            </fieldset>

            <PendingButton
              idleLabel="Create account"
              pendingLabel="Creating workspace..."
              className="w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183b28]"
            />
          </form>

          <p className="mt-6 text-center text-sm text-[#5b6a61]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#214d35]">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
