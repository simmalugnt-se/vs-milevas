import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

const sanitizeRedirect = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/";
  }

  return value;
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const redirectTo = sanitizeRedirect(formData.get("redirect"));
  const logoutURL = new URL("/api/users/logout", request.url);

  const response = await fetch(logoutURL, {
    method: "POST",
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  const nextResponse = NextResponse.redirect(new URL(redirectTo, request.url));
  const setCookie = "getSetCookie" in response.headers ? response.headers.getSetCookie() : [];

  for (const cookie of setCookie) {
    nextResponse.headers.append("set-cookie", cookie);
  }

  const draft = await draftMode();
  draft.disable();

  return nextResponse;
}
