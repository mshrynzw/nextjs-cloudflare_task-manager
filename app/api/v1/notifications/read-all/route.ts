import { withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { getDb } from "@/lib/db/server";
import { readAllNotifications } from "@/lib/services/user-service";

export const POST = withApiAuth(async (_request, { user }) => {
  const data = await readAllNotifications(getDb(), user.userId);
  return jsonOk(data);
});
