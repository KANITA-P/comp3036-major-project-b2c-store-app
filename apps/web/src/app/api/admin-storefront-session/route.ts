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

function clearAdminCookie(response: NextResponse) {
  response.cookies.set(ADMIN_AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
}

function invalidRedirect(request: Request) {
  const redirectUrl = new URL("/", request.url);
  const invalidResponse = NextResponse.redirect(redirectUrl, 303);

  clearAdminCookie(invalidResponse);

  return invalidResponse;
}

function invalidJson() {
  const response = NextResponse.json(
    { error: "Invalid or expired storefront session token" },
    { status: 401 },
  );

  clearAdminCookie(response);

  return response;
}

async function verifyAdminHandoffToken(token: string) {
  if (!token) return null;

  const payload = verifyJwt(token, getJwtSecret());
  const userId = Number(payload.sub);

  if (
    !Number.isInteger(userId) ||
    userId < 1 ||
    payload.aud !== HANDOFF_AUDIENCE ||
    payload.role !== "ADMIN" ||
    typeof payload.email !== "string"
  ) {
    return null;
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
    return null;
  }

  return user;
}

function setStorefrontSessionCookie(
  response: NextResponse,
  request: Request,
  user: {
    id: number;
    name: string;
    email: string;
  },
) {
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
  clearAdminCookie(response);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const redirectUrl = new URL("/", request.url);

  if (!token) {
    return invalidRedirect(request);
  }

  try {
    const user = await verifyAdminHandoffToken(token);

    if (!user) return invalidRedirect(request);

    const response = NextResponse.redirect(redirectUrl, 303);

    setStorefrontSessionCookie(response, request, user);

    return response;
  } catch {
    return invalidRedirect(request);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";

  if (!token) {
    return invalidJson();
  }

  try {
    const user = await verifyAdminHandoffToken(token);

    if (!user) return invalidJson();

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "ADMIN",
      },
    });

    setStorefrontSessionCookie(response, request, user);

    return response;
  } catch {
    return invalidJson();
  }
}
