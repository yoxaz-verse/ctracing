import type { MetadataRoute } from "next";
import { absoluteUrl, publicRoutes } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: Pick<BlogPost, "slug" | "updated_at" | "published_at">[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("slug,updated_at,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .returns<Pick<BlogPost, "slug" | "updated_at" | "published_at">[]>();
    posts = data ?? [];
  } catch {
    posts = [];
  }

  const routeEntries = publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
  const blogEntries = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...routeEntries, ...blogEntries];
}
