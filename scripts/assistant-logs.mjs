import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { finished } from "node:stream/promises";
import { fileURLToPath } from "node:url";

/** Handles Vercel request logs, runtime messages, Payload logger envelopes and plain JSONL. */
export function extractAssistantLogs(raw) {
  const records = new Map();
  const chunks = new Map();
  let platformTruncations = 0;
  const visit = (value) => {
    if (typeof value === "string") {
      for (const line of value.split("\n")) {
        try {
          const clean = line.replace(/\u001b\[[0-9;]*m/g, "");
          const start = clean.indexOf("{");
          visit(JSON.parse(start >= 0 ? clean.slice(start) : clean));
        } catch {
          /* Non-JSON server messages. */
        }
      }
      return;
    }
    if (!value || typeof value !== "object") return;
    if (
      value.msg === "editor-assistant debug" &&
      typeof value.traceId === "string" &&
      Number.isInteger(value.sequence)
    ) {
      const key = `${value.traceId}:${value.sequence}`;
      if (value.event === "trace.chunk") {
        if (
          !Number.isInteger(value.part) ||
          !Number.isInteger(value.parts) ||
          value.parts < 1 ||
          value.parts > 100 ||
          value.part < 0 ||
          value.part >= value.parts ||
          typeof value.data !== "string"
        )
          return;
        const group = chunks.get(key) ?? {
          traceId: value.traceId,
          sequence: value.sequence,
          parts: value.parts,
          data: new Map(),
        };
        group.data.set(value.part, value.data);
        chunks.set(key, group);
      } else if (typeof value.event === "string") records.set(key, value);
      return;
    }
    if (value.messageTruncated === true) {
      const entry = {
        msg: "editor-assistant debug",
        traceId: `vercel-request:${value.id ?? "unknown"}`,
        sequence: ++platformTruncations,
        event: "export.truncated",
        data: { reason: "Vercel truncated a runtime message. Inspect the raw export." },
      };
      records.set(`platform:${platformTruncations}`, entry);
    }
    if (Array.isArray(value)) {
      for (const entry of value) visit(entry);
      return;
    }
    // Request log .logs contains every message; .message may duplicate just the first one.
    for (const key of ["logs", "message", "msg"]) if (value[key] !== undefined) visit(value[key]);
  };
  visit(raw);
  for (const [key, group] of chunks) {
    if (group.data.size === group.parts) {
      try {
        const encoded = Array.from({ length: group.parts }, (_, part) => group.data.get(part)).join(
          "",
        );
        visit(JSON.parse(Buffer.from(encoded, "base64").toString("utf8")));
        continue;
      } catch {
        /* Keep an explicit marker when Vercel truncated a chunk. */
      }
    }
    records.set(key, {
      msg: "editor-assistant debug",
      traceId: group.traceId,
      sequence: group.sequence,
      event: "trace.incomplete",
      data: { receivedParts: group.data.size, expectedParts: group.parts },
    });
  }
  return [...records.values()].sort(
    (a, b) => a.traceId.localeCompare(b.traceId) || a.sequence - b.sequence,
  );
}

export async function main(args = process.argv.slice(2)) {
  if (args.includes("--help")) {
    console.log(
      "pnpm assistant:logs [--deployment URL] [--since 1h] [--until ISO] [--environment production|preview] [--project NAME] [--scope TEAM] [--limit 1000] [--out .assistant-debug] [--input FILE]",
    );
    return;
  }
  const allowed = new Set([
    "deployment",
    "since",
    "until",
    "environment",
    "project",
    "scope",
    "limit",
    "out",
    "input",
  ]);
  const options = {};
  for (let index = 0; index < args.length; index++) {
    if (args[index] === "--") continue;
    const key = args[index].replace(/^--/, "");
    const value = args[++index];
    if (!allowed.has(key) || !value || value.startsWith("--"))
      throw new Error("Invalid option; run pnpm assistant:logs --help.");
    options[key] = value;
  }
  const limit = Number(options.limit ?? 1000);
  if (!Number.isInteger(limit) || limit < 1 || limit > 10000)
    throw new Error("--limit must be between 1 and 10000 requests.");
  const output = resolve(options.out ?? ".assistant-debug");
  await mkdir(output, { recursive: true, mode: 0o700 });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const rawPath = resolve(output, `vercel-${stamp}.raw.jsonl`);
  let raw;
  if (options.input) {
    raw = await readFile(resolve(options.input), "utf8");
  } else {
    const cliArgs = [
      "logs",
      "--json",
      "--expand",
      "--no-follow",
      "--no-branch",
      "--query",
      '"editor-assistant debug"',
      "--since",
      options.since ?? "1h",
      "--limit",
      String(limit),
    ];
    for (const key of ["deployment", "until", "environment", "project", "scope"])
      if (options[key]) cliArgs.push(`--${key}`, options[key]);
    const file = createWriteStream(rawPath, { flags: "wx", mode: 0o600 });
    const child = spawn("vercel", cliArgs, { stdio: ["ignore", "pipe", "inherit"] });
    child.stdout.pipe(file);
    file.on("error", () => child.kill());
    const exit = new Promise((fulfill, reject) => {
      child.on("error", (error) => {
        file.end();
        reject(
          error.code === "ENOENT"
            ? new Error("Install the Vercel CLI and sign in with vercel login first.")
            : error,
        );
      });
      child.on("close", (code) => fulfill(code));
    });
    const [code] = await Promise.all([exit, finished(file)]);
    if (code !== 0)
      throw new Error(`Vercel logs failed (${code}). Any partial output remains in ${rawPath}.`);
    raw = await readFile(rawPath, "utf8");
  }
  const records = extractAssistantLogs(raw);
  const path = resolve(output, `assistant-${stamp}.jsonl`);
  await writeFile(
    path,
    records.map((record) => JSON.stringify(record)).join("\n") + (records.length ? "\n" : ""),
    { flag: "wx", mode: 0o600 },
  );
  console.log(
    `Saved ${records.length} events from ${new Set(records.map((record) => record.traceId)).size} runs to ${path}`,
  );
  if (!records.length)
    console.log(
      "No assistant events found. Check DEBUG_ASSISTANT on the deployed version, the deployment and the log retention window.",
    );
  if (
    records.some((record) =>
      ["trace.incomplete", "trace.truncated", "export.truncated"].includes(record.event),
    )
  )
    console.log("Some events were truncated. Inspect the trace markers and the raw export.");
  const requests = raw.split("\n").filter(Boolean).length;
  if (!options.input && requests >= limit)
    console.log(
      "The request limit was reached; narrow --since/--until or increase --limit to fetch more.",
    );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
