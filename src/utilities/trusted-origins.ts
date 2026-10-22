type Env = Record<string, string | undefined>;

function origin(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  try {
    return new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`).origin;
  } catch {
    return null;
  }
}

/** `https://www.example.se` and `https://example.se`: a site may redirect either way. */
function withWww(value: string) {
  const url = new URL(value);
  const other = url.hostname.startsWith("www.")
    ? url.hostname.slice("www.".length)
    : `www.${url.hostname}`;
  const ownDomain =
    url.hostname.includes(".") &&
    !url.hostname.endsWith(".vercel.app") &&
    !/^[\d.]+$/.test(url.hostname);
  return ownDomain ? [value, `${url.protocol}//${other}${url.port ? `:${url.port}` : ""}`] : [value];
}

/**
 * Payload's `csrf`: the origins whose requests may use the Admin login cookie. Payload also trusts
 * a request's Host only when it is listed, for links in its emails (password resets).
 *
 * Deployed on Vercel: the site's address and the deployment's own. Elsewhere only
 * `PAYLOAD_TRUSTED_ORIGINS` (comma-separated), so local development on any port keeps working.
 */
export function trustedOrigins(env: Env = process.env): string[] {
  const listed = (env.PAYLOAD_TRUSTED_ORIGINS ?? "").split(",");
  const deployed = env.VERCEL
    ? [
        env.NEXT_PUBLIC_SITE_URL,
        env.NEXT_PUBLIC_SERVER_URL,
        env.VERCEL_PROJECT_PRODUCTION_URL,
        env.VERCEL_URL,
        env.VERCEL_BRANCH_URL,
      ]
    : [];

  const origins = [...listed, ...deployed]
    .map(origin)
    .filter((value): value is string => Boolean(value));

  return [...new Set(origins.flatMap(withWww))];
}
