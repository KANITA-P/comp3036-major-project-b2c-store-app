import { client } from "@repo/db/client";
import { cookies } from "next/headers";
import { signJwt, verifyJwt } from "./jwt";

export const CUSTOMER_AUTH_COOKIE_NAME = "customer_auth_token";

export type CustomerSession = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export function getJwtSecret() {
  return process.env.JWT_SECRET || "threadline-dev-secret";
}

export function createCustomerToken(user: CustomerSession) {
  return signJwt(
    {
      sub: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    60 * 60 * 24 * 7,
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

    const user = await client.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}
