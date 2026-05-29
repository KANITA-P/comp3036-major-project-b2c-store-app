type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

const loginAttempts = new Map<string, RateLimitEntry>();

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function getLoginRateLimitKey(request: Request, email: string) {
  return `${getClientIp(request)}:${email}`;
}

export function isLoginRateLimited(key: string) {
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry) return false;

  if (entry.resetAt <= now) {
    loginAttempts.delete(key);
    return false;
  }

  return entry.count >= RATE_LIMIT_MAX_ATTEMPTS;
}

export function recordFailedLogin(key: string) {
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  entry.count += 1;
}

export function clearLoginRateLimit(key: string) {
  loginAttempts.delete(key);
}
