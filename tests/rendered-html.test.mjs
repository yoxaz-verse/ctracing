import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the TeraTrace homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>Carbon Credit Marketplace India for Buyers and Sellers \| TeraTrace<\/title>/i,
  );
  assert.match(
    html,
    /TeraTrace helps Indian carbon credit buyers, project sellers, and facilitators/i,
  );
  assert.match(html, /<link rel="canonical" href="https:\/\/teratrace\.com\/"\/>/i);
  assert.match(
    html,
    /<meta property="og:title" content="Carbon Credit Marketplace India for Buyers and Sellers"/i,
  );
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"\/>/i);
  assert.match(html, /"@type":"WebSite"/);
  assert.match(html, /"@type":"Organization"/);
  assert.match(html, /"@type":"SoftwareApplication"/);
  assert.match(html, /India-first visibility into carbon credit supply/);
  assert.match(html, /Carbon credit marketplace/);
  assert.match(html, /For project sellers/);
  assert.match(html, /For buyers/);
  assert.match(html, /For sellers/);
  assert.match(html, /For facilitators/);
  assert.doesNotMatch(html, /For admins|Admin oversight|Operator audit/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders public SEO endpoints", async () => {
  const sitemapResponse = await render("/sitemap.xml");
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  assert.match(sitemap, /<loc>https:\/\/teratrace\.com\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/teratrace\.com\/estimator<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/teratrace\.com\/signup<\/loc>/);

  const robotsResponse = await render("/robots.txt");
  assert.equal(robotsResponse.status, 200);
  const robots = await robotsResponse.text();
  assert.match(robots, /Allow: \/estimator/);
  assert.match(robots, /Disallow: \/dashboard/);
  assert.match(robots, /Sitemap: https:\/\/teratrace\.com\/sitemap\.xml/);
});

test("server-renders facilitator signup role", async () => {
  const response = await render("/signup");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /value="facilitator"/);
  assert.match(html, /Match credible opportunities/);
  assert.match(html, /admin verification/i);
});

test("facilitator dashboard shell navigation is wired", async () => {
  const source = await readFile(
    new URL("../app/dashboard/_components/DashboardShell.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /Facilitator workspace/);
  assert.match(source, /\/dashboard\/facilitator\/matches/);
  assert.match(source, /\/dashboard\/facilitator\/messages/);
});
