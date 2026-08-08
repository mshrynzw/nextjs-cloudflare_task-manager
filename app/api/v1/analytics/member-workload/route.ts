import { withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { parseSearchParams } from "@/lib/api/schemas";
import { getDb } from "@/lib/db/server";
import { getMemberWorkloadAnalytics } from "@/lib/services/analytics-service";
import { z } from "zod";

const querySchema = z.object({
  projectId: z.string().optional(),
});

export const GET = withApiAuth(async (request, { user }) => {
  const query = parseSearchParams(querySchema, request.nextUrl.searchParams);
  const data = await getMemberWorkloadAnalytics(
    getDb(),
    user.userId,
    query.projectId,
  );
  return jsonOk(data);
});
