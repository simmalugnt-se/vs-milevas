/**
 * The editor assistant's model must read images (it will write alt texts), so it is reached through
 * Vercel AI Gateway with a model that does. Shared by `pnpm setup` and assistant-model.ts.
 *
 * GPT-6 Luna is the default (decided 2026-10-01): it reads images, costs the least and does the job.
 * Comparing models with the plugin evals can wait until there is a reason to.
 */
export const DEFAULT_GATEWAY_MODEL = "openai/gpt-6-luna";

/**
 * Whether the configured model cannot read images: DeepSeek's, directly or through the gateway.
 * Projects on one keep working for text, with a warning.
 *
 * @param {string | undefined} provider `AI_PROVIDER`
 * @param {string | undefined} model `AI_MODEL`
 */
export function textOnlyModel(provider, model) {
  return provider === "deepseek" || /^deepseek\//i.test(model?.trim() ?? "");
}
