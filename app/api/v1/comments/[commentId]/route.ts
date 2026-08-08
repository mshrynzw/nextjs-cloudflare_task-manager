import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { updateCommentBodySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import { patchComment, removeComment } from "@/lib/services/task-service";

export const PATCH = withApiAuth(async (request, { params, user }) => {
  const body = updateCommentBodySchema.parse(await parseJsonBody(request));
  const data = await patchComment(
    getDb(),
    user.userId,
    params.commentId,
    body.content,
  );
  return jsonOk(data);
});

export const DELETE = withApiAuth(async (_request, { params, user }) => {
  const data = await removeComment(getDb(), user.userId, params.commentId);
  return jsonOk(data);
});
