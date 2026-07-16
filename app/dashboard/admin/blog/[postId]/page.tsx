import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  updateBlogPost,
} from "@/app/dashboard/actions";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { PendingButton } from "@/app/_components/PendingButton";
import { getSessionProfile, redirectForRole } from "@/lib/auth";
import type { BlogPost } from "@/lib/types";
import { BlogPostFields } from "../BlogPostFields";

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

export default async function EditBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ error?: string; saved?: string; created?: string }>;
}) {
  const routeParams = await params;
  const queryParams = await searchParams;
  const { supabase, profile } = await getSessionProfile();

  if (profile.role !== "admin") {
    redirectForRole(profile.role);
  }

  const { data: post } = await supabase
    .from("blog_posts")
    .select(
      "id,author_id,title,slug,excerpt,body,cover_image_url,tags,status,published_at,created_at,updated_at",
    )
    .eq("id", routeParams.postId)
    .maybeSingle<BlogPost>();

  if (!post) {
    notFound();
  }

  return (
    <DashboardShell profile={profile} activeRole="admin">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#557462]">
          Edit blog post
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-[#5b6a61]">
              Status: {post.status}. Published: {formatDate(post.published_at)}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.status === "published" ? (
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex rounded-full border border-[#c8d2c2] px-5 py-3 text-sm font-semibold text-[#314239]"
              >
                View public post
              </Link>
            ) : null}
            <Link
              href="/dashboard/admin/blog"
              className="inline-flex rounded-full border border-[#c8d2c2] px-5 py-3 text-sm font-semibold text-[#314239]"
            >
              Back to blog
            </Link>
          </div>
        </div>
        {queryParams.error ? (
          <p className="mt-5 rounded-2xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8a2c16]">
            {queryParams.error}
          </p>
        ) : queryParams.saved || queryParams.created ? (
          <p className="mt-5 rounded-2xl bg-[var(--surface-positive)] px-4 py-3 text-sm font-semibold text-[var(--brand)]">
            Blog post saved.
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.34fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
          <form action={updateBlogPost}>
            <BlogPostFields
              post={post}
              redirectTo={`/dashboard/admin/blog/${post.id}`}
            />
            <PendingButton
              idleLabel="Save changes"
              pendingLabel="Saving..."
              className="mt-5 rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
            />
          </form>
        </div>

        <aside className="rounded-3xl bg-[#e3eadf] p-6 ring-1 ring-[#ccd8c6]">
          <h2 className="text-2xl font-semibold">Publishing</h2>
          <p className="mt-3 text-sm leading-6 text-[#5b6a61]">
            Publish finished posts to make them visible on the public blog.
            Unpublish to return a post to draft status.
          </p>
          <div className="mt-5 grid gap-3">
            <form action={post.status === "published" ? unpublishBlogPost : publishBlogPost}>
              <input type="hidden" name="postId" value={post.id} />
              <input
                type="hidden"
                name="redirectTo"
                value={`/dashboard/admin/blog/${post.id}`}
              />
              <PendingButton
                idleLabel={post.status === "published" ? "Unpublish post" : "Publish post"}
                pendingLabel="Saving..."
                className="w-full rounded-full bg-[#214d35] px-5 py-3 text-sm font-semibold text-white"
              />
            </form>
            <form action={deleteBlogPost}>
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="redirectTo" value="/dashboard/admin/blog" />
              <PendingButton
                idleLabel="Delete post"
                pendingLabel="Deleting..."
                className="w-full rounded-full border border-[#d9b8ad] px-5 py-3 text-sm font-semibold text-[#8a2c16]"
              />
            </form>
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}
