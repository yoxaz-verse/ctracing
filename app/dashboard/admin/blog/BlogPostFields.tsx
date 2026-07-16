import type { BlogPost } from "@/lib/types";

type BlogPostFieldsProps = {
  post?: BlogPost;
  redirectTo: string;
};

function tagsToInput(tags: string[] | undefined) {
  return tags?.join(", ") ?? "";
}

export function BlogPostFields({ post, redirectTo }: BlogPostFieldsProps) {
  return (
    <div className="grid gap-5">
      {post ? <input type="hidden" name="postId" value={post.id} /> : null}
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-[var(--text-label)]">
          Title
        </span>
        <input
          name="title"
          required
          defaultValue={post?.title}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--brand)]"
          placeholder="Carbon market insights for Indian buyers"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-[var(--text-label)]">
          Slug
        </span>
        <input
          name="slug"
          defaultValue={post?.slug}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--brand)]"
          placeholder="carbon-market-insights-india"
        />
        <span className="text-xs text-[var(--text-soft)]">
          Leave blank on new posts to generate from the title.
        </span>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-[var(--text-label)]">
          Excerpt
        </span>
        <textarea
          name="excerpt"
          required
          defaultValue={post?.excerpt}
          rows={3}
          className="resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 outline-none focus:border-[var(--brand)]"
          placeholder="A short summary that appears on the blog listing and search previews."
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-[var(--text-label)]">
          Body
        </span>
        <textarea
          name="body"
          required
          defaultValue={post?.body}
          rows={16}
          className="resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 outline-none focus:border-[var(--brand)]"
          placeholder="Write the blog body here. Separate paragraphs with blank lines."
        />
      </label>

      <div className="grid gap-5 md:grid-cols-[1fr_0.42fr]">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-[var(--text-label)]">
            Cover image URL
          </span>
          <input
            name="coverImageUrl"
            type="url"
            defaultValue={post?.cover_image_url ?? ""}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--brand)]"
            placeholder="https://..."
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-[var(--text-label)]">
            Status
          </span>
          <select
            name="status"
            defaultValue={post?.status ?? "draft"}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--brand)]"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-[var(--text-label)]">
          Tags
        </span>
        <input
          name="tags"
          defaultValue={tagsToInput(post?.tags)}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--brand)]"
          placeholder="Carbon credits, India, Buyers"
        />
        <span className="text-xs text-[var(--text-soft)]">
          Separate tags with commas.
        </span>
      </label>
    </div>
  );
}
