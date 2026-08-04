import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = Boolean(request.cookies.get("auth_token"));

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  // Optimistic check only: the auth_token cookie's presence is not proof of a
  // valid session (it may be stale/expired). Real validation happens in the
  // backend middleware and the client-side guard in useAuth, so auth pages are
  // never redirected away here.
  if (isProtected && !authed) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup", "/forgot-password", "/reset-password", "/verify-email"],
};
