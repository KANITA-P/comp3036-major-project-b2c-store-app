type HeaderSource = {
  get(name: string): string | null | undefined;
};

export function getRequestIp(headers: HeaderSource): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    const trimmed = firstIp?.trim();
    if (trimmed) return trimmed;
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "127.0.0.1";
}
