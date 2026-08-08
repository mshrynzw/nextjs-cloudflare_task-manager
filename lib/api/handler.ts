import type { NextRequest } from "next/server";
import { toErrorResponse } from "@/lib/api/http";
import { requireSessionUser } from "@/lib/auth/authorization";
import { unauthorized } from "@/lib/api/errors";

type RouteContext = {
  params: Promise<Record<string, string>>;
};

type AuthenticatedHandler = (
  request: NextRequest,
  context: {
    params: Record<string, string>;
    user: Awaited<ReturnType<typeof requireSessionUser>>;
  },
) => Promise<Response>;

export function withApiAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest, context: RouteContext) => {
    try {
      const user = await requireSessionUser();
      if (!user.userId) {
        throw unauthorized();
      }
      const params = await context.params;
      return await handler(request, { params, user });
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export async function parseJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
