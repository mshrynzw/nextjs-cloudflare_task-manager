import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { updateChecklistBodySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import {
  patchChecklistItem,
  removeChecklistItem,
} from "@/lib/services/task-service";

export const PATCH = withApiAuth(async (request, { params, user }) => {
  const body = updateChecklistBodySchema.parse(await parseJsonBody(request));
  const data = await patchChecklistItem(
    getDb(),
    user.userId,
    params.checklistId,
    body,
  );
  return jsonOk(data);
});

export const DELETE = withApiAuth(async (_request, { params, user }) => {
  const data = await removeChecklistItem(
    getDb(),
    user.userId,
    params.checklistId,
  );
  return jsonOk(data);
});
