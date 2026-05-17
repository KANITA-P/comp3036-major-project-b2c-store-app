import { createHmac, timingSafeEqual } from "node:crypto";

export type JwtPayload = Record<string, unknown> & {
  exp?: number;
};

function toBase64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding =
    normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));

  return Buffer.from(`${normalized}${padding}`, "base64");
}

function signPart(value: string, secret: string) {
  return toBase64Url(createHmac("sha256", secret).update(value).digest());
}

export function signJwt(
  payload: JwtPayload,
  secret: string,
  expiresInSeconds: number,
) {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const body = {
    ...payload,
    exp: nowInSeconds + expiresInSeconds,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(body));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = signPart(unsignedToken, secret);

  return `${unsignedToken}.${signature}`;
}

export function verifyJwt(token: string, secret: string) {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error("Invalid token structure");
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signPart(unsignedToken, secret);
  const providedSignature = Buffer.from(encodedSignature);
  const actualSignature = Buffer.from(expectedSignature);

  if (
    providedSignature.length !== actualSignature.length ||
    !timingSafeEqual(providedSignature, actualSignature)
  ) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(
    fromBase64Url(encodedPayload).toString("utf8"),
  ) as JwtPayload;

  if (
    typeof payload.exp !== "number" ||
    payload.exp <= Math.floor(Date.now() / 1000)
  ) {
    throw new Error("Token expired");
  }

  return payload;
}
