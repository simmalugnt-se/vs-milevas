#!/usr/bin/env node
/**
 * `pnpm setup`: a short guide for a new project, in the spirit of create-next-app. It asks whether
 * the project runs on this computer or in the cloud (Neon, optionally R2 for files) and which
 * optional features to turn on, then saves the answers in `.env.local` and prepares the database.
 * Only the cloud values are pasted into `.env.local` by hand, as Neon shows them.
 */
import { spawn } from "node:child_process";
import * as p from "@clack/prompts";
import { DEFAULT_GATEWAY_MODEL, textOnlyModel } from "../src/utilities/assistant-models.mjs";
import { storageKind } from "../src/utilities/services.mjs";
import { writeEnv } from "./lib/local-env.mjs";
import {
  backupEnvFile,
  checkCloudValues,
  ensureEnvFile,
  migrationEnvironment,
  readEnvFile,
  unsafeEnvValue,
} from "./setup-env.mjs";

let saved = readEnvFile();

/**
 * Gateway models offered in the guide, all reading images; the first is the default. Any other can
 * be typed in.
 */
const GATEWAY_MODELS = [{ value: DEFAULT_GATEWAY_MODEL, label: "GPT-6 Luna", hint: "recommended" }];

/** Stops the guide on Ctrl+C; choices are only saved after the last question. */
function answer(value) {
  if (p.isCancel(value)) {
    p.cancel("Setup stopped. Your choices were not saved.");
    process.exit(0);
  }
  return value;
}

function required(value) {
  return value?.trim() ? undefined : "Please fill this in.";
}

function saveable(value) {
  return unsafeEnvValue(value)
    ? "This contains spaces, quotes, # or $, which cannot be saved. Check that you copied the right value."
    : undefined;
}

const check =
  (...rules) =>
  (value) => {
    for (const rule of rules) {
      const problem = rule(value ?? "");
      if (problem) return problem;
    }
    return undefined;
  };

/** A visible answer, starting from the saved one unless `options.initialValue` replaces it. */
async function ask(message, key, options = {}) {
  const value = answer(
    await p.text({
      message,
      placeholder: options.placeholder,
      initialValue: "initialValue" in options ? options.initialValue : saved[key],
      validate: check(required, saveable, ...(options.rules ?? [])),
    }),
  );
  return value.trim();
}

/** A hidden answer. When one is saved already, Enter keeps it. */
async function askSecret(message, key) {
  const keep = Boolean(saved[key]);
  const value = answer(
    await p.password({
      message: keep ? `${message} (press Enter to keep the saved one)` : message,
      validate: check((value) => (keep ? undefined : required(value)), saveable),
    }),
  );
  return value.trim() || saved[key];
}

async function main() {
  if (!process.stdin.isTTY) {
    console.error("Run pnpm setup in a terminal: it asks you a few questions.");
    process.exit(1);
  }

  p.intro("Set up your Payload site");
  p.log.message(
    "A few questions, then the database is prepared. Your choices are saved when you confirm at the end.",
  );

  const values = { PAYLOAD_LOCAL_PUSH: "false" };

  // Database and files
  const savedFiles = storageKind(saved.AWS_ENDPOINT_URL_S3) === "r2" ? "neon-r2" : "neon";
  const services = answer(
    await p.select({
      message: "Where should the database and uploaded files live?",
      initialValue: saved.SERVICES === "cloud" ? savedFiles : "local",
      options: [
        {
          value: "local",
          label: "On this computer",
          hint: "Postgres in Docker, files in the project folder",
        },
        { value: "neon", label: "Neon", hint: "database and file storage in a Neon project" },
        {
          value: "neon-r2",
          label: "Neon and Cloudflare R2",
          hint: "database in Neon, files in R2",
        },
      ],
    }),
  );
  values.SERVICES = services === "local" ? "local" : "cloud";
  if (services !== "local") {
    await askForCloudValues(services === "neon" ? "neon" : "r2");
  }

  // Assistant. Projects from before AI_PROVIDER that only have a DeepSeek key use DeepSeek.
  const savedProvider =
    saved.AI_PROVIDER ||
    (saved.DEEPSEEK_API_KEY ? "deepseek" : saved.AI_GATEWAY_API_KEY ? "gateway" : "off");
  const assistant = answer(
    await p.confirm({
      message: "Turn on the AI assistant that helps editors write content?",
      initialValue: savedProvider !== "off",
    }),
  );
  let modelLabel;
  if (assistant) {
    // Only gateway models that read images are offered; a project on DeepSeek moves over here.
    if (textOnlyModel(savedProvider, saved.AI_MODEL)) {
      p.log.warn(
        "Your assistant uses DeepSeek, which cannot read images. It needs a model that does to write alt texts, so choose one below.",
      );
    }
    values.AI_PROVIDER = "gateway";
    const savedModel = textOnlyModel(savedProvider, saved.AI_MODEL) ? "" : saved.AI_MODEL;
    const known = GATEWAY_MODELS.some((model) => model.value === savedModel);
    const choice = answer(
      await p.select({
        message: "Which model? The assistant reaches it through Vercel AI Gateway.",
        initialValue: known ? savedModel : savedModel ? "other" : DEFAULT_GATEWAY_MODEL,
        options: [...GATEWAY_MODELS, { value: "other", label: "Another model…" }],
      }),
    );
    values.AI_MODEL =
      choice === "other"
        ? await ask(
            "Model ID of a model that reads images, as listed on vercel.com/ai-gateway/models",
            "AI_MODEL",
            {
              placeholder: "provider/model",
              initialValue: savedModel,
              rules: [
                (value) =>
                  /^[\w.-]+\/[\w.:-]+$/.test(value.trim())
                    ? undefined
                    : "Use provider/model, e.g. openai/gpt-6-luna",
                (value) =>
                  textOnlyModel("gateway", value)
                    ? "DeepSeek's models cannot read images. Choose one that can."
                    : undefined,
              ],
            },
          )
        : choice;
    modelLabel =
      GATEWAY_MODELS.find((model) => model.value === values.AI_MODEL)?.label ?? values.AI_MODEL;
    if (!saved.AI_GATEWAY_API_KEY) {
      p.log.info(
        "Create a key in the Vercel dashboard under AI Gateway > API Keys. A deployed site on Vercel does not need it.",
      );
    }
    values.AI_GATEWAY_API_KEY = await askSecret("AI Gateway API key", "AI_GATEWAY_API_KEY");
  } else {
    // Keys stay in .env.local, so turning the assistant on again later is one question.
    values.AI_PROVIDER = "off";
  }

  // Video: on unless turned off before.
  const muxOn = saved.PAYLOAD_MUX_ENABLED !== "false";
  const mux = answer(await p.confirm({ message: "Use Mux for video?", initialValue: muxOn }));
  values.PAYLOAD_MUX_ENABLED = String(mux);
  if (mux) {
    if (!saved.MUX_TOKEN_ID) {
      p.log.info(
        "Create an access token under Settings > Access Tokens at https://dashboard.mux.com",
      );
    }
    values.MUX_TOKEN_ID = await askSecret("Mux token ID", "MUX_TOKEN_ID");
    values.MUX_TOKEN_SECRET = await askSecret("Mux token secret", "MUX_TOKEN_SECRET");
  }

  // MCP
  const mcp = answer(
    await p.confirm({
      message:
        "Let AI tools such as Claude work with your content (MCP)? You create keys for them in Admin.",
      initialValue: saved.PAYLOAD_MCP_ENABLED === "true",
    }),
  );
  values.PAYLOAD_MCP_ENABLED = String(mcp);

  // Summary
  const on = (value) => (value ? "on" : "off");
  const [databaseLabel, filesLabel] = {
    local: ["On this computer (Docker)", "On this computer"],
    neon: ["Neon", "Neon storage"],
    "neon-r2": ["Neon", "Cloudflare R2"],
  }[services];
  p.note(
    [
      `Database    ${databaseLabel}`,
      `Files       ${filesLabel}`,
      `Assistant   ${assistant ? `on, ${modelLabel}` : "off"}`,
      `Video       ${on(mux)}`,
      `MCP         ${on(mcp)}`,
    ].join("\n"),
    "Your choices",
  );
  const go = answer(
    await p.confirm({
      message:
        services === "local"
          ? "Save and prepare the database?"
          : "Save and create the tables in the Neon database?",
      initialValue: true,
    }),
  );
  if (!go) {
    p.cancel("Setup stopped. Your choices were not saved.");
    return;
  }

  const backedUp = backupEnvFile();
  ensureEnvFile();
  writeEnv(values);
  p.log.success(
    backedUp
      ? "Saved to .env.local (the previous version is in .env.local.setup-backup)."
      : "Saved to .env.local.",
  );

  const spin = p.spinner();
  spin.start(
    services === "local"
      ? "Starting the database and creating tables (the first time can take a minute)"
      : "Creating tables in Neon",
  );
  const result = await run(
    "pnpm",
    [services === "local" ? "setup:local" : "db:migrate"],
    migrationEnvironment(readEnvFile()),
  );
  if (result.code !== 0) {
    spin.error("The database could not be prepared");
    console.log(result.output);
    p.outro("Your answers are saved. Fix the problem above, then run pnpm setup again.");
    process.exit(1);
  }
  spin.stop("Database ready");

  const port = readEnvFile().POSTGRES_HOST_PORT;
  if (services === "local" && port && port !== saved.POSTGRES_HOST_PORT) {
    p.log.info(`The database uses port ${port}, since the usual one was taken.`);
  }
  p.outro(
    [
      "All set. Next:",
      "  pnpm dev",
      "  Open http://localhost:3000/admin and create your first user.",
      "  On an empty site, the first start adds a home page with example content.",
      "",
      "To switch between this computer and the cloud later, change SERVICES in .env.local.",
    ].join("\n"),
  );
}

/**
 * Waits until `.env.local` has the cloud values, pasted by hand as the provider shows them, and
 * they look right. The guide never rewrites them.
 * @param {"neon" | "r2"} files
 */
async function askForCloudValues(files) {
  ensureEnvFile();
  let result = checkCloudValues(readEnvFile(), files);
  if (result.problems.length > 0) {
    p.note(
      files === "neon"
        ? [
            "1. At https://console.neon.tech, create a project with Postgres and Storage,",
            "   or open the one you have. Use a development branch, not your live site's.",
            "2. In Storage, set the bucket's access to public read: images on the site",
            "   must be visible to everyone.",
            "3. Copy the environment variables Neon shows (DATABASE_URL, AWS_… and",
            "   S3_BUCKET) and paste them as they are at the end of .env.local.",
          ].join("\n")
        : [
            "1. From Neon (https://console.neon.tech), paste DATABASE_URL and",
            "   DATABASE_URL_POOLED at the end of .env.local, as Neon shows them.",
            "2. In Cloudflare R2, create a bucket and turn on public access.",
            "   Add a CORS rule for your site's address (see docs/setup.md).",
            "3. Create an R2 API token with Object Read & Write for the bucket, and add:",
            "     AWS_ENDPOINT_URL_S3=https://<account-id>.r2.cloudflarestorage.com",
            "     AWS_ACCESS_KEY_ID=…",
            "     AWS_SECRET_ACCESS_KEY=…",
            "     AWS_REGION=auto",
            "     S3_BUCKET=<bucket name>",
            "     S3_PUBLIC_URL=<the bucket's public address>",
          ].join("\n"),
      files === "neon" ? "Add your Neon project" : "Add Neon and Cloudflare R2",
    );
    while (result.problems.length > 0) {
      const next = answer(
        await p.select({
          message: "Save .env.local, then:",
          options: [
            { value: "check", label: "Check again" },
            { value: "stop", label: "Stop for now" },
          ],
        }),
      );
      if (next === "stop") {
        p.cancel("Setup stopped. Run pnpm setup again when the values are in .env.local.");
        process.exit(0);
      }
      result = checkCloudValues(readEnvFile(), files);
      if (result.problems.length > 0) {
        p.log.warn(result.problems.join("\n"));
      }
    }
  }
  saved = readEnvFile();
  p.log.success(result.found.join("\n"));
}

/** Runs a command quietly and returns its exit code and output, shown only when it fails. */
function run(command, args, env) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { env, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    child.on("error", (error) => resolve({ code: 1, output: error.message }));
    child.on("close", (code) => resolve({ code, output }));
  });
}

main().catch((error) => {
  p.cancel(error.message);
  process.exit(1);
});
