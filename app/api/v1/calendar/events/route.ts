import { withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { parseSearchParams } from "@/lib/api/schemas";
import { getDb } from "@/lib/db/server";
import { getCalendarEvents } from "@/lib/services/calendar-service";
import { z } from "zod";

const calendarQuerySchema = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const GET = withApiAuth(async (request, { user }) => {
  const query = parseSearchParams(
    calendarQuerySchema,
    request.nextUrl.searchParams,
  );
  const data = await getCalendarEvents(getDb(), user.userId, query);
  return jsonOk(data);
});
