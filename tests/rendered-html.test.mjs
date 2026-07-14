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
  assert.match(html, /<title>TeraTrace \| Carbon Credit Marketplace<\/title>/i);
  assert.match(html, /Trusted visibility into carbon credit supply/);
  assert.match(html, /Carbon credit marketplace/);
  assert.match(html, /For project sellers/);
  assert.match(html, /For buyers/);
  assert.match(html, /For sellers/);
  assert.match(html, /For facilitators/);
  assert.doesNotMatch(html, /For admins|Admin oversight|Operator audit/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
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
