import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveLinkFieldHref } from "../src/payload/utilities/link-field.ts";

const page = (slug: string) => ({ relationTo: "pages", value: { slug } });

test("an internal link goes to its page, at a block's anchor when it has one", () => {
  assert.equal(resolveLinkFieldHref({ type: "internal", reference: page("om-oss") }), "/om-oss");
  assert.equal(
    resolveLinkFieldHref({ type: "internal", reference: page("om-oss"), anchor: "kontakt" }),
    "/om-oss#kontakt",
  );
  assert.equal(
    resolveLinkFieldHref({ type: "internal", reference: page("home"), anchor: " finansiering " }),
    "/#finansiering",
  );
  // No page, no link, whatever the anchor.
  assert.equal(resolveLinkFieldHref({ type: "internal", anchor: "kontakt" }), null);
});
