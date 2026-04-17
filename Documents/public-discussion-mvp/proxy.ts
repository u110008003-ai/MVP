import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SERVER_SESSION_COOKIE } from "@/lib/auth-constants";
import { isProtectedPagePath } from "@/lib/protected-routes";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPagePath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(SERVER_SESSION_COOKIE)?.value;

  if (accessToken) {
    return NextResponse.next();
  }

  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("auth", "required");
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/cases/:path*"],
};
