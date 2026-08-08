import { withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { getDb } from "@/lib/db/server";
import { readNotification } from "@/lib/services/user-service";

export const PATCH = withApiAuth(async (_request, { params, user }) => {
  const data = await readNotification(
    getDb(),
    user.userId,
    params.notificationId,
  );
  return jsonOk(data);
});
