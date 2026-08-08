import { forbidden } from "@/lib/api/errors";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function getAllowedOrigins(): string[] {
  const origins = new Set<string>();
  const candidates = [
    process.env.AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    try {
      origins.add(new URL(candidate).origin);
    } catch {
      // ignore invalid env URLs
    }
  }

  // Local development convenience
  origins.add("http://localhost:3000");
  origins.add("http://127.0.0.1:3000");
  origins.add("http://localhost:3100");
  origins.add("http://127.0.0.1:3100");

  return [...origins];
}

/**
 * Reject cross-site cookie-authenticated API mutations.
 * Browser navigations and same-origin fetches are allowed.
 */
export function assertSameOriginMutation(request: Request): void {
  if (SAFE_METHODS.has(request.method.toUpperCase())) {
    return;
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "same-origin" || fetchSite === "none") {
    return;
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    // Non-browser clients (curl, server-to-server) often omit Origin.
    // Keep allowlisted for now; tighten when API keys are introduced.
    return;
  }

  const allowed = getAllowedOrigins();
  if (!allowed.includes(origin)) {
    throw forbidden("Cross-origin request blocked.");
  }
}
