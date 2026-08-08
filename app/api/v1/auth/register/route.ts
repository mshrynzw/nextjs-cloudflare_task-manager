import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { parseJsonBody } from "@/lib/api/handler";
import {
  conflict,
  tooManyRequests,
  validationError,
} from "@/lib/api/errors";
import { jsonCreated, toErrorResponse } from "@/lib/api/http";
import { credentialsSchema } from "@/lib/auth/credentials-schema";
import { isEmailAuthEnabled } from "@/lib/auth/flags";
import { hashPassword } from "@/lib/auth/password";
import { createId, nowUnix } from "@/lib/db/id";
import { userSettings, users } from "@/lib/db/schema";
import { getDbAsync } from "@/lib/db/server";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import { assertSameOriginMutation } from "@/lib/security/origin";
import { checkRateLimit } from "@/lib/security/rate-limit";

const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    assertSameOriginMutation(request);

    if (!isEmailAuthEnabled()) {
      throw validationError("Email authentication is disabled.");
    }

    const body = await parseJsonBody(request);
    const parsed = credentialsSchema.safeParse(body);
    if (!parsed.success) {
      throw validationError(
        "Enter a valid email and a password of at least 8 characters.",
      );
    }

    const ip = getClientIpFromHeaders(request.headers);
    const registerLimit = checkRateLimit(
      `auth:register:${ip}`,
      REGISTER_LIMIT,
      REGISTER_WINDOW_MS,
    );
    if (!registerLimit.allowed) {
      throw tooManyRequests(
        `Too many attempts. Try again in ${registerLimit.retryAfterSeconds} seconds.`,
      );
    }

    const email = parsed.data.email.toLowerCase();
    const db = await getDbAsync();
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (existing) {
      // Avoid confirming that an account already exists.
      throw conflict(
        "Unable to register with this email. Try signing in or use a different email.",
      );
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

    return jsonCreated({ email });
  } catch (error) {
    return toErrorResponse(error);
  }
}
