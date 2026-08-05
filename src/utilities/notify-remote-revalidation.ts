const REVALIDATE_REMOTE_URL = process.env.PAYLOAD_REVALIDATE_REMOTE_URL?.trim();

/**
 * Fire-and-forget notification to the remote deployment (e.g. Vercel staging) so its
 * Next.js cache is purged when content is saved locally against a shared database.
 */
export async function notifyRemoteRevalidation() {
  if (!REVALIDATE_REMOTE_URL) {
    return;
  }

  const secret = process.env.PAYLOAD_SECRET?.trim();
  if (!secret) {
    return;
  }

  try {
    await fetch(`${REVALIDATE_REMOTE_URL}/api/revalidate-all`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
  } catch {
    // fire-and-forget — failure is acceptable
  }
}
