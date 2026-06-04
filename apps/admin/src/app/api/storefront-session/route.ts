import { NextResponse } from "next/server";
import { getCurrentAdmin } from "../../../utils/auth";
import { signJwt } from "../../../utils/jwt";

const WEB_URL = (
  process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3001"
).replace(/\/$/, "");
const HANDOFF_AUDIENCE = "admin-storefront-handoff";
const HANDOFF_MAX_AGE = 60;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required for admin storefront handoff");
  }

  return secret;
}

export async function GET() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.redirect(WEB_URL, 303);
  }

  const token = signJwt(
    {
      sub: String(admin.id),
      email: admin.email,
      role: "ADMIN",
      aud: HANDOFF_AUDIENCE,
    },
    getJwtSecret(),
    HANDOFF_MAX_AGE,
  );
  const url = new URL("/api/admin-storefront-session", WEB_URL);

  url.searchParams.set("token", token);

  return NextResponse.redirect(url, 303);
}
