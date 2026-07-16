import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/estimator",
        "/blog",
        "/signup",
        "/login",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/verify-email/pending",
      ],
      disallow: ["/dashboard", "/dashboard/", "/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
