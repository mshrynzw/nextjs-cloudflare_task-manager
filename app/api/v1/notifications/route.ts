import { withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { getDb } from "@/lib/db/server";
import { getNotifications } from "@/lib/services/user-service";

export const GET = withApiAuth(async (_request, { user }) => {
  const data = await getNotifications(getDb(), user.userId);
  return jsonOk(data);
});
