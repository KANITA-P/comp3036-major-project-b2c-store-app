import { client } from "@repo/db/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  CUSTOMER_AUTH_COOKIE_NAME,
  createCustomerToken,
  getAuthCookieOptions,
} from "@/utils/auth";

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

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
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

  response.cookies.set(
    CUSTOMER_AUTH_COOKIE_NAME,
    token,
    getAuthCookieOptions(request),
  );

  return response;
}
