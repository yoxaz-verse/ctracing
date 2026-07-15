import type { Metadata } from "next";
import {
  defaultSeoDescription,
  defaultSeoTitle,
  seoKeywords,
  siteName,
  siteOrigin,
} from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  applicationName: siteName,
  title: {
    default: defaultSeoTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultSeoDescription,
  keywords: seoKeywords,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "Carbon credit marketplace",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: defaultSeoTitle,
    description: defaultSeoDescription,
    url: "/",
    siteName,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultSeoTitle,
    description: defaultSeoDescription,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    (() => {
      try {
        const savedTheme = localStorage.getItem("teratrace-theme");
        const theme = savedTheme === "dark" || savedTheme === "light"
          ? savedTheme
          : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
      } catch {
        document.documentElement.dataset.theme = "light";
        document.documentElement.style.colorScheme = "light";
      }
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
