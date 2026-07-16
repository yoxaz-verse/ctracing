import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { absoluteUrl, jsonLd, pageMetadata, siteName } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not published";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
  }).format(new Date(value));
}

function bodyParagraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

async function getPublishedPost(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(
      "id,author_id,title,slug,excerpt,body,cover_image_url,tags,status,published_at,created_at,updated_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<BlogPost>();

  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) {
    return pageMetadata({
      title: "Blog Post Not Found | TeraTrace",
      description: "The requested TeraTrace blog post could not be found.",
      path: `/blog/${slug}`,
    });
  }

  return {
    ...pageMetadata({
      title: `${post.title} | TeraTrace Blog`,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
    }),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: absoluteUrl(`/blog/${post.slug}`),
      siteName,
      type: "article",
      locale: "en_IN",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at ?? post.published_at,
    author: {
      "@type": "Organization",
      name: siteName,
      url: absoluteUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/favicon.svg"),
      },
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <main className="min-h-screen bg-[var(--background)] text-[var(--text)]">
        <header className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
            <Link
              href="/"
              className="shrink-0 text-lg font-semibold text-[var(--brand)] sm:text-xl"
            >
              TeraTrace
            </Link>
            <Link
              href="/blog"
              className="whitespace-nowrap rounded-full border border-[var(--border)] px-3.5 py-1.5 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]"
            >
              All articles
            </Link>
          </div>
        </header>

        <article>
          <section className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
            <div className="mx-auto max-w-4xl px-5 py-12 lg:px-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-soft)]">
                <span>{formatDate(post.published_at)}</span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--surface-positive)] px-2.5 py-1 text-[var(--brand)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--text-heading)] md:text-5xl">
                {post.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-[var(--text-muted)]">
                {post.excerpt}
              </p>
            </div>
          </section>

          {post.cover_image_url ? (
            <div className="mx-auto max-w-4xl px-5 pt-8 lg:px-6">
              <div
                aria-hidden="true"
                className="h-[min(460px,58vw)] min-h-64 w-full rounded-xl border border-[var(--border)] bg-cover bg-center"
                style={{ backgroundImage: `url(${post.cover_image_url})` }}
              />
            </div>
          ) : null}

          <section className="mx-auto max-w-3xl px-5 py-10 lg:px-6">
            <div className="space-y-6 text-lg leading-8 text-[var(--text)]">
              {bodyParagraphs(post.body).map((paragraph, paragraphIndex) => (
                <p key={`paragraph-${paragraphIndex}`}>
                  {paragraph.split("\n").map((line, index, lines) => (
                    <span key={`${line}-${index}`}>
                      {line}
                      {index < lines.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
