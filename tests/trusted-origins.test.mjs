import assert from "node:assert/strict";
import { test } from "node:test";
import { trustedOrigins } from "../src/utilities/trusted-origins.ts";

test("local development trusts every origin, as before", () => {
  assert.deepEqual(trustedOrigins({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }), []);
});

test("a Vercel deployment trusts the site and its own addresses, with and without www", () => {
  assert.deepEqual(
    trustedOrigins({
      VERCEL: "1",
      NEXT_PUBLIC_SITE_URL: "https://www.example.se/",
      VERCEL_PROJECT_PRODUCTION_URL: "example.se",
      VERCEL_URL: "site-abc123.vercel.app",
      VERCEL_BRANCH_URL: "site-git-main.vercel.app",
    }),
    [
      "https://www.example.se",
      "https://example.se",
      "https://site-abc123.vercel.app",
      "https://site-git-main.vercel.app",
    ],
  );
});

test("PAYLOAD_TRUSTED_ORIGINS adds origins anywhere", () => {
  assert.deepEqual(
    trustedOrigins({ PAYLOAD_TRUSTED_ORIGINS: "https://cms.example.se, http://localhost:3000" }),
    ["https://cms.example.se", "https://www.cms.example.se", "http://localhost:3000"],
  );
});
