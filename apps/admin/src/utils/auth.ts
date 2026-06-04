import { client } from "@repo/db/client";
import { env } from "@repo/env/admin";
import { cookies } from "next/headers";
import { verifyJwt } from "./jwt";

export const AUTH_COOKIE_NAME = "auth_token";
export const CUSTOMER_AUTH_COOKIE_NAME = "customer_auth_token";
export const ADMIN_TOKEN_AUDIENCE = "admin";
export const ADMIN_TOKEN_MAX_AGE = 60 * 60 * 24;

export type AdminTokenPayload = {
  userId: number;
  email: string;
  role: "ADMIN";
  aud: typeof ADMIN_TOKEN_AUDIENCE;
};

export type AdminSession = {
  id: number;
  email: string;
};

export function getAdminJwtSecret() {
  return env.ADMIN_JWT_SECRET;
}

function isAdminTokenPayload(
  payload: Record<string, unknown>,
): payload is AdminTokenPayload {
  return (
    typeof payload.userId === "number" &&
    Number.isInteger(payload.userId) &&
    payload.userId > 0 &&
    typeof payload.email === "string" &&
    payload.role === "ADMIN" &&
    payload.aud === ADMIN_TOKEN_AUDIENCE
  );
}

export function getAdminAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const userCookies = await cookies();
  const token = userCookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const payload = verifyJwt(token, getAdminJwtSecret());

    if (!isAdminTokenPayload(payload)) return null;

    const user = await client.db.user.findUnique({
      where: { id: payload.userId },
      select: {
        email: true,
        role: true,
      },
    });

    if (user?.email !== payload.email || user.role !== "ADMIN") return null;

    return {
      id: payload.userId,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export async function isLoggedIn(): Promise<boolean> {
  return Boolean(await getCurrentAdmin());
}
