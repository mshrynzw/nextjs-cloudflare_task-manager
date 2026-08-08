import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { updateTaskPositionBodySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import { updateTaskPositionForUser } from "@/lib/services/task-service";

export const PATCH = withApiAuth(async (request, { params, user }) => {
  const body = updateTaskPositionBodySchema.parse(await parseJsonBody(request));
  const data = await updateTaskPositionForUser(
    getDb(),
    user.userId,
    params.taskId,
    body,
  );
  return jsonOk(data);
});
