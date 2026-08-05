import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import type { CollectionSlug, PayloadRequest } from "payload";

import { getPayloadClient } from "@/payload/get-payload";

const PREVIEW_COLLECTIONS = new Set<CollectionSlug>(["pages"]);

function normalizeRouteKey(value: string | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(req: NextRequest) {
  const payload = await getPayloadClient();

  const { searchParams } = new URL(req.url);

  const path = searchParams.get("path");
  const collection = searchParams.get("collection") as CollectionSlug;
  const routeKey = normalizeRouteKey(searchParams.get("slug"));
  const previewSecret = searchParams.get("previewSecret");

  if (previewSecret !== process.env.PREVIEW_SECRET) {
    return new Response("You are not allowed to preview this page", {
      status: 403,
    });
  }

  if (!path || !routeKey || !PREVIEW_COLLECTIONS.has(collection)) {
    return new Response("Insufficient search params", { status: 404 });
  }

  if (!path.startsWith("/")) {
    return new Response("This endpoint can only be used for relative previews", {
      status: 500,
    });
  }

  let user;

  try {
    user = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    });
  } catch (error) {
    payload.logger.error({ err: error }, "Error verifying token for live preview");
    return new Response("You are not allowed to preview this page", {
      status: 403,
    });
  }

  const draft = await draftMode();

  if (!user) {
    draft.disable();
    return new Response("You are not allowed to preview this page", {
      status: 403,
    });
  }

  draft.enable();

  return redirect(path);
}
