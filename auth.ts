import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { authConfig } from "@/auth.config";
import { credentialsSchema } from "@/lib/auth/credentials-schema";
import { isEmailAuthEnabled } from "@/lib/auth/flags";
import {
  DUMMY_PASSWORD_HASH,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";
import { nowUnix } from "@/lib/db/id";
import {
  accounts,
  sessions,
  userSettings,
  users,
  verificationTokens,
} from "@/lib/db/schema";
import { getDbAsync } from "@/lib/db/server";
import { parseAuthEnv } from "@/lib/env/schema";
import { checkRateLimit } from "@/lib/security/rate-limit";

// Fail fast when required auth environment is missing or incomplete.
parseAuthEnv(process.env);

const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function buildProviders() {
  const providers = [];

  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
      }),
    );
  }

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }),
    );
  }

  if (isEmailAuthEnabled()) {
    providers.push(
      Credentials({
        id: "credentials",
        name: "Email",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(rawCredentials, request) {
          const parsed = credentialsSchema.safeParse(rawCredentials);
          if (!parsed.success) {
            return null;
          }

          const email = parsed.data.email.toLowerCase();
          const ip = request
            ? clientIpFromRequest(request)
            : "unknown";
          const limit = checkRateLimit(
            `auth:login:${ip}:${email}`,
            LOGIN_LIMIT,
            LOGIN_WINDOW_MS,
          );
          if (!limit.allowed) {
            return null;
          }

          try {
            const db = await getDbAsync();
            const user = await db
              .select()
              .from(users)
              .where(eq(users.email, email))
              .get();

            const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
            const isValid = await verifyPassword(
              parsed.data.password,
              passwordHash,
            );

            if (!user?.passwordHash || !isValid) {
              return null;
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          } catch (error) {
            console.error("[auth] credentials authorize failed", error);
            return null;
          }
        },
      }),
    );
  }

  return providers;
}

/**
 * Async Auth.js config so OpenNext can resolve D1 via
 * `getCloudflareContext({ async: true })` inside Route Handlers.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const db = await getDbAsync();

  return {
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    providers: buildProviders(),
    events: {
      async createUser({ user }) {
        if (!user.id) {
          return;
        }

        const timestamp = nowUnix();
        const eventDb = await getDbAsync();
        await eventDb
          .insert(userSettings)
          .values({
            userId: user.id,
            createdAt: timestamp,
            updatedAt: timestamp,
          })
          .onConflictDoNothing();
      },
    },
  };
});

export { credentialsSchema, hashPassword, isEmailAuthEnabled };
