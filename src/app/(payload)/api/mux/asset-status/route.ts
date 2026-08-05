import { NextRequest, NextResponse } from "next/server";
import {
  abortResponse,
  corsHeaders,
  corsOptionsResponse,
  isAbortLikeError,
  requireMuxAuth,
  requireMuxCredentials,
} from "../shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest): Promise<Response> {
  const authError = await requireMuxAuth(req);
  if (authError) return authError;

  const credentialsError = requireMuxCredentials();
  if (credentialsError) return credentialsError;

  if (req.signal.aborted) {
    return abortResponse();
  }

  const { searchParams } = new URL(req.url);
  const assetId = searchParams.get("assetId");

  if (!assetId) {
    return NextResponse.json(
      { error: "Missing assetId parameter" },
      { status: 400, headers: corsHeaders() },
    );
  }

  const muxTokenId = process.env.MUX_TOKEN_ID!;
  const muxTokenSecret = process.env.MUX_TOKEN_SECRET!;

  try {
    const response = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${muxTokenId}:${muxTokenSecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: req.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `Mux API error: ${response.statusText}`,
          details: errorText,
        },
        { status: response.status, headers: corsHeaders() },
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { headers: corsHeaders() });
  } catch (error) {
    if (isAbortLikeError(error)) {
      return abortResponse();
    }

    console.error("Error fetching Mux asset status:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
