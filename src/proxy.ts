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
      '<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Milevas</title><style>body{min-height:100vh;margin:0;display:grid;place-items:center;background:#E0FF3C}img{display:block;width:min(80vw,720px);height:auto}</style></head><body><img src="/milevas-logo.svg" alt="Milevas"></body></html>',
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
    "/((?!api|admin|_next/static|_next/image|favicon.ico|icon.svg|milevas-logo.svg|robots.txt|sitemap|.*\\.xml$|routes).*)",
  ],
};
