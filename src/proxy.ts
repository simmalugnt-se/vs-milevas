import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  if (process.env.MILEVAS_LANDING_ONLY === "true") {
    if (request.nextUrl.pathname !== "/") {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.headers.set("Cache-Control", "no-store");
      return response;
    }

    return new NextResponse(
      '<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Milevas</title><style>body{min-height:100vh;margin:0;display:grid;place-items:center;font-family:Arial,sans-serif}h1{font-size:clamp(3rem,10vw,7rem);font-weight:400}</style></head><body><h1>Milevas</h1></body></html>',
      {
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/html; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|admin|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap|.*\\.xml$|routes).*)",
  ],
};
