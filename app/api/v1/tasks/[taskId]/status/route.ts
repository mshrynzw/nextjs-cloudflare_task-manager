import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { updateTaskStatusBodySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import { updateTaskStatusForUser } from "@/lib/services/task-service";

export const PATCH = withApiAuth(async (request, { params, user }) => {
  const body = updateTaskStatusBodySchema.parse(await parseJsonBody(request));
  const data = await updateTaskStatusForUser(
    getDb(),
    user.userId,
    params.taskId,
    body.status,
  );
  return jsonOk({ id: data.id, status: data.status });
});
