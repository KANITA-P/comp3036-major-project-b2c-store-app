import { client } from "@repo/db/client";
import { NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE_NAME,
  CUSTOMER_AUTH_COOKIE_NAME,
  createCustomerToken,
  getAuthCookieOptions,
  getJwtSecret,
} from "@/utils/auth";
import { verifyJwt } from "@/utils/jwt";

const HANDOFF_AUDIENCE = "admin-storefront-handoff";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const redirectUrl = new URL("/", request.url);
  const invalidResponse = NextResponse.redirect(redirectUrl, 303);

  invalidResponse.cookies.set(ADMIN_AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  if (!token) {
    return invalidResponse;
  }

  try {
    const payload = verifyJwt(token, getJwtSecret());
    const userId = Number(payload.sub);

    if (
      !Number.isInteger(userId) ||
      userId < 1 ||
      payload.aud !== HANDOFF_AUDIENCE ||
      payload.role !== "ADMIN" ||
      typeof payload.email !== "string"
    ) {
      return invalidResponse;
    }

    const user = await client.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user || user.email !== payload.email || user.role !== "ADMIN") {
      return invalidResponse;
    }

    const response = NextResponse.redirect(redirectUrl, 303);

    response.cookies.set(
      CUSTOMER_AUTH_COOKIE_NAME,
      createCustomerToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: "ADMIN",
      }),
      getAuthCookieOptions(request),
    );
    response.cookies.set(ADMIN_AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch {
    return invalidResponse;
  }
}
