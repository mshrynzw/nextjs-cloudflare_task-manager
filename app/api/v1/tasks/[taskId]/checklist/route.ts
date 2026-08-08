import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonCreated, jsonOk } from "@/lib/api/http";
import { createChecklistBodySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import { addChecklistItem, getChecklist } from "@/lib/services/task-service";

export const GET = withApiAuth(async (_request, { params, user }) => {
  const data = await getChecklist(getDb(), user.userId, params.taskId);
  return jsonOk(data);
});

export const POST = withApiAuth(async (request, { params, user }) => {
  const body = createChecklistBodySchema.parse(await parseJsonBody(request));
  const data = await addChecklistItem(
    getDb(),
    user.userId,
    params.taskId,
    body.title,
  );
  return jsonCreated(data);
});
