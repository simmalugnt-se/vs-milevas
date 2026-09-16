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

    const shareImageUrl = new URL("/milevas-og.png", request.url).toString();

    return new NextResponse(
      `<!doctype html>
<html lang="sv">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#E0FF3C">
    <meta name="description" content="Milevas officiella webbplats.">
    <meta name="robots" content="noindex, nofollow">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Milevas">
    <meta property="og:description" content="Milevas officiella webbplats.">
    <meta property="og:image" content="${shareImageUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" type="image/svg+xml" href="/icon.svg">
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/apple-icon.png">
    <title>Milevas</title>
    <style>body{min-height:100vh;margin:0;display:grid;place-items:center;background:#E0FF3C}img{display:block;width:min(80vw,720px);height:auto}</style>
  </head>
  <body><img src="/milevas-logo.svg" alt="Milevas"></body>
</html>`,
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
    "/((?!api|admin|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|milevas-logo.svg|milevas-og.png|robots.txt|sitemap|.*\\.xml$|routes).*)",
  ],
};
