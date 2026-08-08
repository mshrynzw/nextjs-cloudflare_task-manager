import { withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { parseSearchParams } from "@/lib/api/schemas";
import { getDb } from "@/lib/db/server";
import { getCompletionTrend } from "@/lib/services/analytics-service";
import { z } from "zod";

const querySchema = z.object({
  projectId: z.string().optional(),
  days: z.coerce.number().int().min(7).max(90).optional(),
});

export const GET = withApiAuth(async (request, { user }) => {
  const query = parseSearchParams(querySchema, request.nextUrl.searchParams);
  const data = await getCompletionTrend(
    getDb(),
    user.userId,
    query.days ?? 14,
    query.projectId,
  );
  return jsonOk(data);
});
