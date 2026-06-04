import { NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE_NAME,
  CUSTOMER_AUTH_COOKIE_NAME,
} from "@/utils/auth";

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(CUSTOMER_AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  response.cookies.set(ADMIN_AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  return response;
}
