type AppEnv = "local" | "prod" | "staging";

const appEnvAliases: Record<string, AppEnv> = {
  development: "local",
  dev: "local",
  local: "local",
  production: "prod",
  prod: "prod",
  preview: "staging",
  stage: "staging",
  staging: "staging",
};

const suffixByAppEnv: Record<AppEnv, string> = {
  local: "LOCAL",
  prod: "PROD",
  staging: "STAGING",
};

export const getAppEnv = (): AppEnv => {
  const raw = (process.env.APP_ENV || "").trim().toLowerCase();
  return appEnvAliases[raw] || "local";
};

export const getEnvSuffix = (): string => suffixByAppEnv[getAppEnv()];

const getNonEmpty = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const resolveEnv = (baseKey: string): string | undefined => {
  const direct = getNonEmpty(process.env[baseKey]);
  if (direct) return direct;

  const envSuffix = getEnvSuffix();
  const namespacedKey = `${baseKey}_${envSuffix}`;
  return getNonEmpty(process.env[namespacedKey]);
};

export const resolveRequiredEnv = (baseKey: string): string => {
  const value = resolveEnv(baseKey);
  if (value) return value;

  const envSuffix = getEnvSuffix();
  const namespacedKey = `${baseKey}_${envSuffix}`;
  throw new Error(
    `Missing environment variable "${baseKey}" (or "${namespacedKey}" for APP_ENV=${getAppEnv()}).`,
  );
};
