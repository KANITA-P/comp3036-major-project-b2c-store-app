import { env } from "@repo/env/admin";
import { client } from "@repo/db/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  ADMIN_TOKEN_AUDIENCE,
  ADMIN_TOKEN_MAX_AGE,
  AUTH_COOKIE_NAME,
  CUSTOMER_AUTH_COOKIE_NAME,
  getAdminAuthCookieOptions,
  getAdminJwtSecret,
} from "../../../utils/auth";
import { signJwt } from "../../../utils/jwt";
import {
  clearLoginRateLimit,
  getLoginRateLimitKey,
  isLoginRateLimited,
  recordFailedLogin,
} from "../../../utils/rate-limit";

function setAuthCookie(response: NextResponse, value: string) {
  response.cookies.set(AUTH_COOKIE_NAME, value, getAdminAuthCookieOptions());
  response.cookies.set(CUSTOMER_AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
}

async function createAuthToken(user: { id: number; email: string }) {
  return signJwt(
    {
      userId: user.id,
      email: user.email,
      role: "ADMIN",
      aud: ADMIN_TOKEN_AUDIENCE,
    },
    getAdminJwtSecret(),
    ADMIN_TOKEN_MAX_AGE,
  );
}

function isJsonRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function invalidCredentialsResponse(request: Request, jsonRequest: boolean) {
  if (jsonRequest) {
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 },
    );
  }

  return NextResponse.redirect(
    new URL("/?error=invalid-credentials", request.url),
    303,
  );
}

export async function POST(request: Request) {
  let email = "";
  let password = "";
  const jsonRequest = isJsonRequest(request);

  try {
    if (jsonRequest) {
      const body = await request.json();
      email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
      password = typeof body?.password === "string" ? body.password : "";
    } else {
      const formData = await request.formData();
      email = normalizeEmail(String(formData.get("email") ?? ""));
      password = String(formData.get("password") ?? "");
    }
  } catch {
    if (jsonRequest) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    return NextResponse.redirect(
      new URL("/?error=invalid-credentials", request.url),
      303,
    );
  }

  if (!email || !password) {
    return invalidCredentialsResponse(request, jsonRequest);
  }

  const rateLimitKey = getLoginRateLimitKey(request, email);

  if (isLoginRateLimited(rateLimitKey)) {
    if (jsonRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many login attempts. Please try again later.",
        },
        { status: 429 },
      );
    }

    return NextResponse.redirect(
      new URL("/?error=too-many-attempts", request.url),
      303,
    );
  }

  if (!env.ADMIN_JWT_SECRET) {
    throw new Error("ADMIN_JWT_SECRET not set");
  }

  const user = await client.db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    recordFailedLogin(rateLimitKey);
    return invalidCredentialsResponse(request, jsonRequest);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    recordFailedLogin(rateLimitKey);
    return invalidCredentialsResponse(request, jsonRequest);
  }

  const token = await createAuthToken(user);
  clearLoginRateLimit(rateLimitKey);

  if (!jsonRequest) {
    const response = NextResponse.redirect(new URL("/", request.url), 303);
    setAuthCookie(response, token);
    return response;
  }

  const response = NextResponse.json({ success: true });
  setAuthCookie(response, token);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  response.cookies.set(CUSTOMER_AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  return response;
}
