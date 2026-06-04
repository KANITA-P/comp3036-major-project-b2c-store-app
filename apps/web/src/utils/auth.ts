import { client } from "@repo/db/client";
import { cookies } from "next/headers";
import { signJwt, verifyJwt } from "./jwt";

export const CUSTOMER_AUTH_COOKIE_NAME = "customer_auth_token";
export const ADMIN_AUTH_COOKIE_NAME = "auth_token";
export const CUSTOMER_TOKEN_AUDIENCE = "customer";
export const CUSTOMER_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export type CustomerSession = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return secret;
}

export function createCustomerToken(user: CustomerSession) {
  return signJwt(
    {
      sub: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      aud: CUSTOMER_TOKEN_AUDIENCE,
    },
    getJwtSecret(),
    CUSTOMER_TOKEN_MAX_AGE,
  );
}

export function getAuthCookieOptions(request: Request) {
  const isHttps = new URL(request.url).protocol === "https:";

  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production" && isHttps,
  };
}

export async function getCurrentUser(): Promise<CustomerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const payload = verifyJwt(token, getJwtSecret());
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId < 1) return null;
    if (payload.aud !== CUSTOMER_TOKEN_AUDIENCE) return null;
    if (payload.role !== "USER" && payload.role !== "ADMIN") return null;

    const user = await client.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}
