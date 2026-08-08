import { headers } from "next/headers";

/**
 * Best-effort client IP for rate limiting.
 * Behind proxies, prefer the first X-Forwarded-For hop.
 */
export function getClientIpFromHeaders(
  headerStore: Headers | { get(name: string): string | null },
): string {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return headerStore.get("x-real-ip")?.trim() || "unknown";
}

export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  return getClientIpFromHeaders(headerStore);
}
