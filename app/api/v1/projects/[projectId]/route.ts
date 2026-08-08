import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { updateProjectBodySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import {
  deleteProjectForUser,
  getProject,
  updateProjectForUser,
} from "@/lib/services/project-service";

export const GET = withApiAuth(async (_request, { params, user }) => {
  const data = await getProject(getDb(), user.userId, params.projectId);
  return jsonOk(data);
});

export const PATCH = withApiAuth(async (request, { params, user }) => {
  const body = updateProjectBodySchema.parse(await parseJsonBody(request));
  const data = await updateProjectForUser(
    getDb(),
    user.userId,
    params.projectId,
    body,
  );
  return jsonOk(data);
});

export const DELETE = withApiAuth(async (_request, { params, user }) => {
  const data = await deleteProjectForUser(
    getDb(),
    user.userId,
    params.projectId,
  );
  return jsonOk(data);
});
