import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { PayloadRequest } from "payload";
import { getSiteUrl } from "@/lib/site";
import { getPayloadClient } from "@/payload/get-payload";

export function getCorsOrigin(): string {
  return getSiteUrl().origin;
}

export function corsHeaders(): Record<string, string> {
  const origin = getCorsOrigin();
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function corsOptionsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

/**
 * Verify that the request comes from an authenticated Payload user.
 * Returns a 403 Response if unauthenticated, or null if authenticated.
 */
export async function requireMuxAuth(req: NextRequest): Promise<Response | null> {
  const payload = await getPayloadClient();

  try {
    const user = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 403, headers: corsHeaders() },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 403, headers: corsHeaders() },
    );
  }

  return null;
}

export function requireMuxCredentials(): Response | null {
  const muxTokenId = process.env.MUX_TOKEN_ID;
  const muxTokenSecret = process.env.MUX_TOKEN_SECRET;

  if (!muxTokenId || !muxTokenSecret) {
    return NextResponse.json(
      {
        error:
          "Missing Mux credentials. Please configure MUX_TOKEN_ID and MUX_TOKEN_SECRET environment variables.",
      },
      { status: 500, headers: corsHeaders() },
    );
  }

  return null;
}

export function abortResponse(): NextResponse {
  return NextResponse.json({ error: "Request aborted" }, { status: 499, headers: corsHeaders() });
}

export function isAbortLikeError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const value = error as { code?: string; message?: string; name?: string };
  return (
    value.name === "AbortError" ||
    value.name === "ResponseAborted" ||
    value.code === "ABORT_ERR" ||
    (typeof value.message === "string" && value.message.toLowerCase().includes("aborted"))
  );
}

export function getMuxErrorMessage(errorText: string): string | null {
  try {
    const parsed = JSON.parse(errorText) as {
      error?: { message?: string; messages?: string[] };
      message?: string;
    };

    if (Array.isArray(parsed.error?.messages) && parsed.error.messages.length > 0) {
      return parsed.error.messages.join(" ");
    }

    if (typeof parsed.error?.message === "string" && parsed.error.message.trim()) {
      return parsed.error.message;
    }

    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // Fall back to the raw response body when Mux returns non-JSON content.
  }

  const trimmed = errorText.trim();
  return trimmed || null;
}
