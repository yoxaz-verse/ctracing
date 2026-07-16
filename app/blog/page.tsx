import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo";
import type { BlogPost } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "TeraTrace Blog | Carbon Credit Market Insights",
  description:
    "Read TeraTrace articles on carbon credit markets, project supply, buyer diligence, and marketplace workflows in India.",
  path: "/blog",
});

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Draft";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function BlogPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(
      "id,author_id,title,slug,excerpt,body,cover_image_url,tags,status,published_at,created_at,updated_at",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .returns<BlogPost[]>();

  const posts = data ?? [];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold text-[var(--brand)] sm:text-xl"
          >
            TeraTrace
          </Link>
          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <Link
              href="/estimator"
              className="whitespace-nowrap rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--brand)] sm:px-3.5 sm:text-sm"
            >
              Estimator
            </Link>
            <Link
              href="/login"
              className="whitespace-nowrap rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--brand)] sm:px-3.5 sm:text-sm"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="whitespace-nowrap rounded-full bg-[var(--brand)] px-3.5 py-1.5 text-xs font-semibold text-[var(--surface)] transition hover:bg-[var(--brand-hover)] sm:px-4 sm:text-sm"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-soft)]">
            TeraTrace blog
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-[var(--text-heading)] md:text-5xl">
            Carbon credit market notes for buyers, sellers, and facilitators.
          </h1>
          <p className="mt-5 max-w-3xl leading-7 text-[var(--text-muted)]">
            Practical articles on marketplace readiness, project signals,
            diligence context, and carbon credit workflows in India.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-6">
        {posts.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
              >
                {post.cover_image_url ? (
                  <div
                    aria-hidden="true"
                    className="h-48 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${post.cover_image_url})` }}
                  />
                ) : null}
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--brand-soft)]">
                    <span>{formatDate(post.published_at)}</span>
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[var(--surface-positive)] px-2.5 py-1 text-[var(--brand)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--text-heading)]">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                    {post.excerpt}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-5 inline-flex rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-[var(--brand)]"
                  >
                    Read article
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <h2 className="text-2xl font-semibold text-[var(--text-heading)]">
              No published articles yet.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              TeraTrace market notes will appear here once the first article is
              published.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
