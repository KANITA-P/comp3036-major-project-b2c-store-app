import { NextResponse, type NextRequest } from "next/server";

const ADMIN_AUTH_COOKIE_NAME = "auth_token";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.cookies.has(ADMIN_AUTH_COOKIE_NAME)) {
    response.cookies.set(ADMIN_AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
