import assert from "node:assert/strict";
import { test } from "node:test";
import {
  coloredHeading,
  coloredLines,
  coloredPlainText,
} from "../src/payload/utilities/colored-text.ts";

test("a colored heading reads back as lines of runs, with the color Lexical keeps", () => {
  const value = coloredHeading([
    [{ text: "Bygg din baoli" }],
    [{ text: "På typ 30 sekunder", color: "yellow" }],
  ]);
  assert.deepEqual(coloredLines(value), [
    [{ text: "Bygg din baoli" }],
    [{ text: "På typ 30 sekunder", color: "yellow" }],
  ]);
  assert.equal(coloredPlainText(value), "Bygg din baoli På typ 30 sekunder");
});

test("a line break starts a new line, empty lines and unknown colors are dropped", () => {
  const value = {
    root: {
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", text: "Ett varumärke inom " },
            { type: "text", text: "KION", $: { color: "yellow" } },
            { type: "linebreak" },
            { type: "text", text: "Group", $: { color: "purple" } },
          ],
        },
        { type: "paragraph", children: [] },
      ],
    },
  };
  assert.deepEqual(coloredLines(value), [
    [{ text: "Ett varumärke inom " }, { text: "KION", color: "yellow" }],
    [{ text: "Group" }],
  ]);
  assert.deepEqual(coloredLines(null), []);
  assert.deepEqual(coloredLines("Bygg din baoli"), []);
});
