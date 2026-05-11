import { env } from "@repo/env/admin";
import { cookies } from "next/headers";
import { verifyJwt } from "./jwt";

export const AUTH_COOKIE_NAME = "auth_token";

export async function isLoggedIn(): Promise<boolean> {
  const userCookies = await cookies();
  const token = userCookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return false;

  if (!env.JWT_SECRET) return false;

  try {
    verifyJwt(token, env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
