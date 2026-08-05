import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const ALL_CMS_TAGS = [
  "pages",
  "sitemap-pages",
  "documents",
  "media",
  "redirects",
  "global:header",
  "global:footer",
];

function getRequestSecret(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }
  return "";
}

export async function POST(request: Request) {
  const secret = process.env.PAYLOAD_SECRET?.trim();

  if (!secret) {
    return NextResponse.json({ error: "PAYLOAD_SECRET not configured" }, { status: 500 });
  }

  const requestSecret = getRequestSecret(request);

  let bodySecret: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    bodySecret = body?.secret?.trim();
  } catch {
    bodySecret = undefined;
  }

  if (requestSecret !== secret && bodySecret !== secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  for (const tag of ALL_CMS_TAGS) {
    revalidateTag(tag, "max");
  }

  revalidatePath("/", "layout");

  return NextResponse.json({
    revalidated: true,
    tags: ALL_CMS_TAGS,
  });
}
