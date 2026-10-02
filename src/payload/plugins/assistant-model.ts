import { createDeepSeek } from "@ai-sdk/deepseek";
import { gateway } from "ai";
import { DEFAULT_GATEWAY_MODEL, textOnlyModel } from "@/utilities/assistant-models.mjs";

/**
 * The model the editor assistant calls, chosen in `.env.local` (normally by `pnpm setup`):
 *
 * - `AI_PROVIDER=gateway`: Vercel AI Gateway, a model in `AI_MODEL` that reads images (default
 *   `openai/gpt-6-luna`). Needs `AI_GATEWAY_API_KEY` locally; on Vercel it signs in by itself.
 * - `AI_PROVIDER=deepseek`: DeepSeek's own API with `DEEPSEEK_API_KEY`. `pnpm setup` no longer
 *   offers it, since DeepSeek cannot read images; projects already on it keep working for text.
 * - `AI_PROVIDER=off`, or nothing configured: no model, the assistant says so when asked.
 *
 * Projects from before `AI_PROVIDER` that only set `DEEPSEEK_API_KEY` keep using DeepSeek.
 */

type Provider = "gateway" | "deepseek";

function chosenProvider(): Provider | null {
  const provider = process.env.AI_PROVIDER;
  if (provider === "gateway" || provider === "deepseek") return provider;
  if (provider === "off") return null;
  if (process.env.DEEPSEEK_API_KEY) return "deepseek";
  if (process.env.AI_GATEWAY_API_KEY) return "gateway";
  return null;
}

function hasCredentials(provider: Provider): boolean {
  if (provider === "deepseek") return Boolean(process.env.DEEPSEEK_API_KEY);
  // On Vercel the gateway authenticates with the deployment's own OIDC token.
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL);
}

/** Why the assistant cannot answer, or null when a model is configured. */
export function assistantModelProblem(): string | null {
  const provider = chosenProvider();
  if (process.env.AI_PROVIDER === "off") {
    return "The assistant is turned off (AI_PROVIDER=off). Run pnpm setup to turn it on.";
  }
  if (!provider) {
    return "No AI model is configured, so the assistant cannot answer. Run pnpm setup to choose one.";
  }
  if (!hasCredentials(provider)) {
    const key = provider === "gateway" ? "AI_GATEWAY_API_KEY" : "DEEPSEEK_API_KEY";
    return `${key} is not set, so the assistant cannot answer. Add it to .env.local or run pnpm setup.`;
  }
  return null;
}

/** A reason to choose another model although this one answers, or null. */
export function assistantModelWarning(): string | null {
  const provider = chosenProvider();
  if (!provider || !textOnlyModel(provider, process.env.AI_MODEL)) return null;
  return "The assistant's model cannot read images, which it needs for alt texts; it still helps with text. Run pnpm setup to choose a model that reads images.";
}

/** The configured model, or null when there is none (see `assistantModelProblem`). */
export function assistantModel(): object | null {
  const provider = chosenProvider();
  if (!provider || !hasCredentials(provider)) return null;
  const model = process.env.AI_MODEL?.trim();
  if (provider === "gateway") return gateway(model || DEFAULT_GATEWAY_MODEL);
  return createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY })(model || "deepseek-chat");
}
