/**
 * Auth feature flags that do not require database access.
 * Prefer importing from here on public pages (e.g. login).
 */
export function isEmailAuthEnabled(): boolean {
  return process.env.AUTH_EMAIL_ENABLED === "true";
}
