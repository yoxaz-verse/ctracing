import type { Metadata } from "next";

const fallbackSiteUrl = "https://teratrace.com";

export const siteName = "TeraTrace";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? fallbackSiteUrl;
export const siteOrigin = new URL(siteUrl).origin;

export const defaultSeoTitle =
  "TeraTrace | Carbon Credit Marketplace India";
export const defaultSeoDescription =
  "TeraTrace is an India-first carbon credit marketplace and platform for project sellers, credit buyers, and facilitators to review supply, verification context, and market interest.";

export const seoKeywords = [
  "carbon credit marketplace India",
  "carbon credit platform India",
  "carbon credits for buyers",
  "carbon project sellers",
  "carbon credit facilitators",
  "verified carbon credits India",
  "carbon credit estimator",
  "sustainability teams India",
  "carbon marketplace platform",
  "TeraTrace",
];

export const publicRoutes = [
  {
    path: "/",
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 1,
  },
  {
    path: "/estimator",
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  },
  {
    path: "/blog",
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  },
  {
    path: "/signup",
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  },
  {
    path: "/login",
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.55,
  },
  {
    path: "/forgot-password",
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.35,
  },
  {
    path: "/reset-password",
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
  {
    path: "/verify-email",
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
  {
    path: "/verify-email/pending",
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
];

export function absoluteUrl(path = "/") {
  return new URL(path, siteOrigin).toString();
}

type PageSeo = {
  title: string;
  description: string;
  path: string;
};

export function pageMetadata({ title, description, path }: PageSeo): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName,
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
