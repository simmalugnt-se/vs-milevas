import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { extractAssistantLogs, main } from "../scripts/assistant-logs.mjs";

const record = (sequence, event = "tool.call", data = { text: "Hej" }) => ({
  msg: "editor-assistant debug",
  traceId: "run-1",
  sequence,
  event,
  data,
});
const wrapper = (entry) =>
  JSON.stringify({ message: JSON.stringify({ level: 30, msg: JSON.stringify(entry) }) });

test("Vercel request logs and Payload envelopes recover every event and deduplicate display messages", () => {
  const first = record(1, "turn.start");
  const second = record(2, "tool.result");
  const raw = JSON.stringify({
    message: JSON.parse(wrapper(first)).message,
    logs: [JSON.parse(wrapper(first)), JSON.parse(wrapper(second)), { message: "unrelated log" }],
  });
  assert.deepEqual(extractAssistantLogs(raw), [first, second]);
  assert.deepEqual(
    extractAssistantLogs(
      JSON.stringify({
        logs: [{ message: `\u001b[32m[11:00:00] INFO:\u001b[39m ${JSON.stringify(first)}\n` }],
      }),
    ),
    [first],
  );
  assert.deepEqual(extractAssistantLogs([first, second].map(JSON.stringify).join("\n")), [
    first,
    second,
  ]);
});

test("chunks arrive out of order, preserve Unicode, and mark missing parts", () => {
  const original = record(2, "tool.result", { text: "Skärmdump 🦐" });
  const encoded = Buffer.from(JSON.stringify(original)).toString("base64");
  const chunks = [0, 1].map((part) => ({
    ...record(2, "trace.chunk"),
    part,
    parts: 2,
    data: part ? encoded.slice(24) : encoded.slice(0, 24),
  }));
  assert.deepEqual(extractAssistantLogs([wrapper(chunks[1]), wrapper(chunks[0])].join("\n")), [
    original,
  ]);
  const incomplete = extractAssistantLogs(wrapper(chunks[0]));
  assert.equal(incomplete[0].event, "trace.incomplete");
  assert.deepEqual(incomplete[0].data, { receivedParts: 1, expectedParts: 2 });
});

test("offline import writes a reusable JSONL artifact without calling Vercel", async () => {
  const directory = await mkdtemp(join(tmpdir(), "assistant-export-"));
  try {
    const input = join(directory, "raw.jsonl");
    await writeFile(input, wrapper(record(1, "turn.start")));
    const output = join(directory, "output");
    await main(["--input", input, "--out", output]);
    const [name] = await readdir(output);
    assert.deepEqual(
      JSON.parse((await readFile(join(output, name), "utf8")).trim()),
      record(1, "turn.start"),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("platform-truncated runtime messages are reported even when their JSON cannot be parsed", () => {
  const records = extractAssistantLogs(
    JSON.stringify({
      logs: [{ message: '{"msg":"editor-assistant debug","traceId":', messageTruncated: true }],
    }),
  );
  assert.equal(records[0].event, "export.truncated");
});
