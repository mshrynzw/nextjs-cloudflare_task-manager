import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { updateTaskBodySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import {
  deleteTaskForUser,
  getTaskDetail,
  updateTaskForUser,
} from "@/lib/services/task-service";

export const GET = withApiAuth(async (_request, { params, user }) => {
  const data = await getTaskDetail(getDb(), user.userId, params.taskId);
  return jsonOk(data);
});

export const PATCH = withApiAuth(async (request, { params, user }) => {
  const body = updateTaskBodySchema.parse(await parseJsonBody(request));
  const data = await updateTaskForUser(
    getDb(),
    user.userId,
    params.taskId,
    body,
  );
  return jsonOk(data);
});

export const DELETE = withApiAuth(async (_request, { params, user }) => {
  const data = await deleteTaskForUser(getDb(), user.userId, params.taskId);
  return jsonOk(data);
});
