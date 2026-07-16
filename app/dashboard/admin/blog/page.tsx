import Link from "next/link";
import {
  deleteBlogPost,
  publishBlogPost,
  unpublishBlogPost,
} from "@/app/dashboard/actions";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { EmptyState } from "@/app/dashboard/_components/EmptyState";
import { StatusBadge } from "@/app/dashboard/_components/StatusBadge";
import { PendingButton } from "@/app/_components/PendingButton";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { BlogPost } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not published";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    published?: string;
    unpublished?: string;
    deleted?: string;
  }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "admin") {
    redirectForRole(profile.role);
  }

  const { data } = await supabase
    .from("blog_posts")
    .select(
      "id,author_id,title,slug,excerpt,body,cover_image_url,tags,status,published_at,created_at,updated_at",
    )
    .order("updated_at", { ascending: false })
    .returns<BlogPost[]>();

  const posts = data ?? [];
  const publishedCount = posts.filter((post) => post.status === "published").length;
  const draftCount = posts.filter((post) => post.status === "draft").length;

  return (
    <DashboardShell profile={profile} activeRole="admin">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
            Blog
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Manage TeraTrace articles.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
            Create official carbon market articles, keep drafts private, and
            publish finished posts to the public blog.
          </p>
        </div>
        <Link
          href="/dashboard/admin/blog/new"
          className="inline-flex w-fit rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
        >
          New blog post
        </Link>
      </section>

      {params.error ? (
        <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
          {params.error}
        </p>
      ) : params.published || params.unpublished || params.deleted ? (
        <p className="mt-5 rounded-2xl bg-[var(--surface-positive)] px-4 py-3 text-sm font-semibold text-[var(--brand)]">
          Blog post updated.
        </p>
      ) : null}

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#dfe5dc]">
          <p className="text-sm text-[#5b6a61]">Total posts</p>
          <p className="mt-2 text-3xl font-semibold">{posts.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#dfe5dc]">
          <p className="text-sm text-[#5b6a61]">Published</p>
          <p className="mt-2 text-3xl font-semibold">{publishedCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#dfe5dc]">
          <p className="text-sm text-[#5b6a61]">Drafts</p>
          <p className="mt-2 text-3xl font-semibold">{draftCount}</p>
        </div>
      </section>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
        {posts.length ? (
          <div className="grid gap-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-[#e0e7dc] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={post.status} />
                      <span className="text-xs font-semibold text-[#6a756d]">
                        /blog/{post.slug}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold">{post.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5b6a61]">
                      {post.excerpt}
                    </p>
                    <p className="mt-3 text-sm text-[#6a756d]">
                      Published: {formatDate(post.published_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/dashboard/admin/blog/${post.id}`}
                      className="rounded-full border border-[#c8d2c2] px-4 py-2 text-sm font-semibold text-[#314239]"
                    >
                      Edit
                    </Link>
                    {post.status === "published" ? (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="rounded-full border border-[#c8d2c2] px-4 py-2 text-sm font-semibold text-[#314239]"
                      >
                        View
                      </Link>
                    ) : null}
                    <form action={post.status === "published" ? unpublishBlogPost : publishBlogPost}>
                      <input type="hidden" name="postId" value={post.id} />
                      <input type="hidden" name="redirectTo" value="/dashboard/admin/blog" />
                      <PendingButton
                        idleLabel={post.status === "published" ? "Unpublish" : "Publish"}
                        pendingLabel="Saving..."
                        className="rounded-full bg-[#214d35] px-4 py-2 text-sm font-semibold text-white"
                      />
                    </form>
                    <form action={deleteBlogPost}>
                      <input type="hidden" name="postId" value={post.id} />
                      <input type="hidden" name="redirectTo" value="/dashboard/admin/blog" />
                      <PendingButton
                        idleLabel="Delete"
                        pendingLabel="Deleting..."
                        className="rounded-full border border-[#d9b8ad] px-4 py-2 text-sm font-semibold text-[#8a2c16]"
                      />
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No blog posts yet."
            detail="Create the first draft article for the public TeraTrace blog."
          />
        )}
      </section>
    </DashboardShell>
  );
}
