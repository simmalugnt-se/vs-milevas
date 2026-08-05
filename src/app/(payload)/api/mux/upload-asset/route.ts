import { NextRequest, NextResponse } from "next/server";
import {
  abortResponse,
  corsHeaders,
  corsOptionsResponse,
  getCorsOrigin,
  getMuxErrorMessage,
  isAbortLikeError,
  requireMuxAuth,
  requireMuxCredentials,
} from "../shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest): Promise<Response> {
  const authError = await requireMuxAuth(req);
  if (authError) return authError;

  const credentialsError = requireMuxCredentials();
  if (credentialsError) return credentialsError;

  if (req.signal.aborted) {
    return abortResponse();
  }

  const muxTokenId = process.env.MUX_TOKEN_ID!;
  const muxTokenSecret = process.env.MUX_TOKEN_SECRET!;

  try {
    const body = await req.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Missing title for the video upload." },
        { status: 400, headers: corsHeaders() },
      );
    }

    const response = await fetch("https://api.mux.com/video/v1/uploads", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${muxTokenId}:${muxTokenSecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        new_asset_settings: {
          playback_policy: ["public"],
          meta: { title },
        },
        cors_origin: getCorsOrigin(),
      }),
      cache: "no-store",
      signal: req.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      const muxErrorMsg = getMuxErrorMessage(errorText);
      return NextResponse.json(
        {
          error: muxErrorMsg
            ? `Mux upload API error: ${muxErrorMsg}`
            : `Mux upload API error: ${response.statusText}`,
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

    console.error("Error creating Mux upload:", error);
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
