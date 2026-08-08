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

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

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

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
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

  const email = parsed.data.email.toLowerCase();
  const db = getDb();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existing) {
    return {
      status: "error",
      message: "An account with this email already exists.",
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
