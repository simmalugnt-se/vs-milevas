import assert from "node:assert/strict";
import { test } from "node:test";
import { slugField } from "../src/payload/fields/slug.ts";

const run = (args) => slugField().hooks.beforeValidate[0](args);

test("a new draft without a title gets no slug, so drafts don't collide", () => {
  assert.equal(run({ data: {}, originalDoc: undefined, value: undefined }), null);
  assert.equal(run({ data: { title: "" }, originalDoc: undefined, value: "" }), null);
  assert.equal(run({ data: { title: "???" }, originalDoc: undefined, value: "" }), null);
});

test("the title gives the slug once there is one", () => {
  assert.equal(run({ data: { title: "Ny sida" }, originalDoc: { slug: "" }, value: "" }), "ny-sida");
});

test("an existing or manually written slug is kept", () => {
  assert.equal(
    run({ data: { title: "Ny titel" }, originalDoc: { slug: "om-oss" }, value: "" }),
    "om-oss",
  );
  assert.equal(
    run({ data: { title: "Ny titel" }, originalDoc: { slug: "om-oss" }, value: "egen" }),
    "egen",
  );
});
