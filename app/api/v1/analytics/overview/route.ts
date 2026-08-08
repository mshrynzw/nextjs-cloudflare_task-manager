import { withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { parseSearchParams } from "@/lib/api/schemas";
import { getDb } from "@/lib/db/server";
import { getAnalyticsOverview } from "@/lib/services/analytics-service";
import { z } from "zod";

const overviewQuerySchema = z.object({
  projectId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const GET = withApiAuth(async (request, { user }) => {
  const query = parseSearchParams(
    overviewQuerySchema,
    request.nextUrl.searchParams,
  );
  const data = await getAnalyticsOverview(
    getDb(),
    user.userId,
    query.projectId,
  );
  return jsonOk(data);
});
