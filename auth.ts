import { compare, hash } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { isEmailAuthEnabled } from "@/lib/auth/flags";
import { nowUnix } from "@/lib/db/id";
import {
  accounts,
  sessions,
  userSettings,
  users,
  verificationTokens,
} from "@/lib/db/schema";
import { getDb } from "@/lib/db/server";
import { parseAuthEnv } from "@/lib/env/schema";

// Fail fast when required auth environment is missing or incomplete.
parseAuthEnv(process.env);

const credentialsSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

/** Dummy hash used to keep password-check timing closer when the user is missing. */
const DUMMY_PASSWORD_HASH =
  "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G2oQ.YHqKzqK2u";

type DrizzleAuthAdapter = ReturnType<typeof DrizzleAdapter>;

/**
 * Lazily open SQLite only when the adapter is first used (OAuth link / user create).
 * Keeps JWT session reads from forcing a DB open at module import time.
 */
function createLazyDrizzleAdapter(): DrizzleAuthAdapter {
  let cached: DrizzleAuthAdapter | undefined;

  const resolve = (): DrizzleAuthAdapter => {
    if (!cached) {
      cached = DrizzleAdapter(getDb(), {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      });
    }
    return cached;
  };

  return new Proxy({} as DrizzleAuthAdapter, {
    get(_target, prop, receiver) {
      const adapter = resolve();
      const value = Reflect.get(adapter as object, prop, receiver);
      if (typeof value === "function") {
        return value.bind(adapter);
      }
      return value;
    },
  });
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
        async authorize(rawCredentials) {
          const parsed = credentialsSchema.safeParse(rawCredentials);
          if (!parsed.success) {
            return null;
          }

          const db = getDb();
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, parsed.data.email.toLowerCase()))
            .get();

          const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
          const isValid = await compare(parsed.data.password, passwordHash);

          if (!user?.passwordHash || !isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        },
      }),
    );
  }

  return providers;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: createLazyDrizzleAdapter(),
  providers: buildProviders(),
  events: {
    async createUser({ user }) {
      if (!user.id) {
        return;
      }

      const timestamp = nowUnix();
      await getDb()
        .insert(userSettings)
        .values({
          userId: user.id,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        .onConflictDoNothing();
    },
  },
});

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export { credentialsSchema, isEmailAuthEnabled };
