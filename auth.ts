import { compare, hash } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { nowUnix } from "@/lib/db/id";
import {
  accounts,
  sessions,
  userSettings,
  users,
  verificationTokens,
} from "@/lib/db/schema";
import { getDb } from "@/lib/db/server";

const credentialsSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export function isEmailAuthEnabled(): boolean {
  return process.env.AUTH_EMAIL_ENABLED === "true";
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

          if (!user?.passwordHash) {
            return null;
          }

          const isValid = await compare(
            parsed.data.password,
            user.passwordHash,
          );
          if (!isValid) {
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
  adapter: DrizzleAdapter(getDb(), {
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

export { credentialsSchema };
