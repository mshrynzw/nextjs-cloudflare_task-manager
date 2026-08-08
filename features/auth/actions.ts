"use server";

import { AuthError } from "next-auth";
import { eq } from "drizzle-orm";
import {
  credentialsSchema,
  hashPassword,
  isEmailAuthEnabled,
  signIn,
} from "@/auth";
import { createId, nowUnix } from "@/lib/db/id";
import { userSettings, users } from "@/lib/db/schema";
import { getDb } from "@/lib/db/server";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

function rateLimited(retryAfterSeconds: number): AuthActionState {
  return {
    status: "error",
    message: `Too many attempts. Try again in ${retryAfterSeconds} seconds.`,
  };
}

export async function signInWithCredentials(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isEmailAuthEnabled()) {
    return {
      status: "error",
      message: "Email authentication is disabled.",
    };
  }

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter a valid email and a password of at least 8 characters.",
    };
  }

  const ip = await getClientIp();
  const emailKey = parsed.data.email.toLowerCase();
  const limit = checkRateLimit(
    `auth:login:${ip}:${emailKey}`,
    LOGIN_LIMIT,
    LOGIN_WINDOW_MS,
  );
  if (!limit.allowed) {
    return rateLimited(limit.retryAfterSeconds);
  }

  try {
    await signIn("credentials", {
      email: emailKey,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "Invalid email or password.",
      };
    }
    throw error;
  }

  return { status: "success" };
}

export async function registerWithCredentials(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isEmailAuthEnabled()) {
    return {
      status: "error",
      message: "Email authentication is disabled.",
    };
  }

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter a valid email and a password of at least 8 characters.",
    };
  }

  const ip = await getClientIp();
  const registerLimit = checkRateLimit(
    `auth:register:${ip}`,
    REGISTER_LIMIT,
    REGISTER_WINDOW_MS,
  );
  if (!registerLimit.allowed) {
    return rateLimited(registerLimit.retryAfterSeconds);
  }

  const email = parsed.data.email.toLowerCase();
  const db = getDb();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existing) {
    // Avoid confirming that an account already exists.
    return {
      status: "error",
      message:
        "Unable to register with this email. Try signing in or use a different email.",
    };
  }

  const timestamp = nowUnix();
  const userId = createId("user");
  const passwordHash = await hashPassword(parsed.data.password);

  await db.insert(users).values({
    id: userId,
    email,
    name: email.split("@")[0] ?? "User",
    passwordHash,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await db.insert(userSettings).values({
    userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "Account created, but sign-in failed. Try signing in.",
      };
    }
    throw error;
  }

  return { status: "success" };
}

export async function signInWithGitHub() {
  await signIn("github", { redirectTo: "/dashboard" });
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}
