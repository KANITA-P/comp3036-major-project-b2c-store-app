import { client } from "@repo/db/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE_NAME,
  CUSTOMER_AUTH_COOKIE_NAME,
  createCustomerToken,
  getAuthCookieOptions,
} from "@/utils/auth";
import {
  clearLoginRateLimit,
  getLoginRateLimitKey,
  isLoginRateLimited,
  recordFailedLogin,
} from "@/utils/rate-limit";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const rateLimitKey = getLoginRateLimitKey(request, email);

  if (isLoginRateLimited(rateLimitKey)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 },
    );
  }

  const user = await client.db.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
    },
  });

  if (!user || user.role !== "USER") {
    recordFailedLogin(rateLimitKey);
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    recordFailedLogin(rateLimitKey);
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const token = createCustomerToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  clearLoginRateLimit(rateLimitKey);

  response.cookies.set(
    CUSTOMER_AUTH_COOKIE_NAME,
    token,
    getAuthCookieOptions(request),
  );
  response.cookies.set(ADMIN_AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  return response;
}
