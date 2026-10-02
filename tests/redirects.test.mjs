import assert from "node:assert/strict";
import { test } from "node:test";
import { findRedirect, resolveRedirectDestination } from "../src/payload/data/redirects-core.ts";

const routing = { defaultLocale: "en", locales: ["en", "sv"] };

test("a redirect matches its path with and without a language prefix", async () => {
  const redirects = [{ from: "/old/", to: { url: "/new" } }];
  assert.equal(findRedirect(redirects, "/old", routing.locales), redirects[0]);
  assert.equal(findRedirect(redirects, "/sv/old", routing.locales), redirects[0]);
  assert.equal(findRedirect(redirects, "/older", routing.locales), undefined);
});

test("custom redirects match deep paths and localize their destination", async () => {
  const destination = await resolveRedirectDestination({
    ...routing,
    locale: "sv",
    redirects: [{ from: "/legacy/deep", to: { url: "/new/path?from=legacy#details" } }],
    url: "/sv/legacy/deep",
  });
  assert.equal(destination, "/sv/new/path?from=legacy#details");
});

test("external and explicitly localized destinations are kept", async () => {
  const resolve = (url) =>
    resolveRedirectDestination({
      ...routing,
      locale: "en",
      redirects: [{ from: "/from", to: { url } }],
      url: "/from",
    });
  assert.equal(await resolve("https://example.com/x"), "https://example.com/x");
  assert.equal(await resolve("/sv/already"), "/sv/already");
});

test("page references resolve to the page's current address in the visitor's language", async () => {
  const redirects = [
    { from: "/old-page", to: { reference: { relationTo: "pages", value: { slug: "new-page" } } } },
    { from: "/old-home", to: { reference: { relationTo: "pages", value: { slug: "home" } } } },
  ];
  const resolve = (url, locale) =>
    resolveRedirectDestination({ ...routing, locale, redirects, url });
  assert.equal(await resolve("/old-page", "en"), "/new-page");
  assert.equal(await resolve("/sv/old-page", "sv"), "/sv/new-page");
  assert.equal(await resolve("/sv/old-home", "sv"), "/sv");
});

test("unpopulated page references are loaded first", async () => {
  const calls = [];
  const destination = await resolveRedirectDestination({
    ...routing,
    loadReference: async (relationTo, id) => {
      calls.push([relationTo, id]);
      return { slug: "loaded" };
    },
    locale: "en",
    redirects: [{ from: "/old", to: { reference: { relationTo: "pages", value: "page-id" } } }],
    url: "/old",
  });
  assert.deepEqual(calls, [["pages", "page-id"]]);
  assert.equal(destination, "/loaded");
});
