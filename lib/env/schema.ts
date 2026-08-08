import { z } from "zod";

/**
 * Server-side environment schema for Auth.js (Phase 3).
 *
 * Provider rollout order:
 * 1. GitHub OAuth (required when auth is enabled)
 * 2. Google OAuth (optional until enabled)
 * 3. Email + Password (optional until AUTH_EMAIL_ENABLED=true)
 */
export const authEnvSchema = z
  .object({
    AUTH_SECRET: z.string().min(32),
    AUTH_URL: z.string().url(),
    AUTH_GITHUB_ID: z.string().min(1),
    AUTH_GITHUB_SECRET: z.string().min(1),
    AUTH_GOOGLE_ID: z.string().min(1).optional(),
    AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
    AUTH_EMAIL_ENABLED: z.enum(["true", "false"]).default("false"),
  })
  .superRefine((value, ctx) => {
    const hasGoogleId = Boolean(value.AUTH_GOOGLE_ID);
    const hasGoogleSecret = Boolean(value.AUTH_GOOGLE_SECRET);

    if (hasGoogleId !== hasGoogleSecret) {
      ctx.addIssue({
        code: "custom",
        message:
          "AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET must both be set or both be omitted",
        path: hasGoogleId ? ["AUTH_GOOGLE_SECRET"] : ["AUTH_GOOGLE_ID"],
      });
    }
  });

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export type AuthEnv = z.infer<typeof authEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

/**
 * Parse public env values. Safe to call from server or client build boundaries
 * that already expose NEXT_PUBLIC_* variables.
 */
export function parsePublicEnv(
  env: Record<string, string | undefined>,
): PublicEnv {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
  });
}

/**
 * Parse auth env values. Call only on the server when Auth.js is configured.
 */
export function parseAuthEnv(env: Record<string, string | undefined>): AuthEnv {
  return authEnvSchema.parse({
    AUTH_SECRET: env.AUTH_SECRET,
    AUTH_URL: env.AUTH_URL,
    AUTH_GITHUB_ID: env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: env.AUTH_GITHUB_SECRET,
    AUTH_GOOGLE_ID: env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: env.AUTH_GOOGLE_SECRET,
    AUTH_EMAIL_ENABLED: env.AUTH_EMAIL_ENABLED ?? "false",
  });
}
