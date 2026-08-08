import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonCreated, jsonOk } from "@/lib/api/http";
import { createCommentBodySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import { addComment, getComments } from "@/lib/services/task-service";

export const GET = withApiAuth(async (_request, { params, user }) => {
  const data = await getComments(getDb(), user.userId, params.taskId);
  return jsonOk(data);
});

export const POST = withApiAuth(async (request, { params, user }) => {
  const body = createCommentBodySchema.parse(await parseJsonBody(request));
  const data = await addComment(
    getDb(),
    user.userId,
    params.taskId,
    body.content,
  );
  return jsonCreated(data);
});
