import { env } from "@repo/env/admin";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "../../../utils/auth";
import { signJwt } from "../../../utils/jwt";

function setAuthCookie(response: NextResponse, value: string) {
  response.cookies.set(AUTH_COOKIE_NAME, value, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

async function createAuthToken() {
  return signJwt({ role: "admin" }, env.JWT_SECRET, 60 * 60 * 24);
}

function isJsonRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}

export async function POST(request: Request) {
  let password = "";
  const jsonRequest = isJsonRequest(request);

  try {
    if (jsonRequest) {
      const body = await request.json();
      password = body?.password ?? "";
    } else {
      const formData = await request.formData();
      password = String(formData.get("password") ?? "");
    }
  } catch {
    if (jsonRequest) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    return NextResponse.redirect(new URL("/?error=invalid-password", request.url), 303);
  }

  if (!env.PASSWORD) {
    throw new Error("PASSWORD not set");
  }

  if (password !== env.PASSWORD) {
    if (jsonRequest) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 },
      );
    }

    return NextResponse.redirect(new URL("/?error=invalid-password", request.url), 303);
  }

  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET not set");
  }

  const token = await createAuthToken();

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

  return response;
}
