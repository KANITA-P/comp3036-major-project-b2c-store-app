import { NextResponse, type NextRequest } from "next/server";

const CUSTOMER_AUTH_COOKIE_NAME = "customer_auth_token";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.cookies.has(CUSTOMER_AUTH_COOKIE_NAME)) {
    response.cookies.set(CUSTOMER_AUTH_COOKIE_NAME, "", {
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
