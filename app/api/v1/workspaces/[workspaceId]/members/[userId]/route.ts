import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { updateWorkspaceMemberBodySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import {
  removeWorkspaceMemberForUser,
  updateWorkspaceMemberRoleForUser,
} from "@/lib/services/workspace-service";

export const PATCH = withApiAuth(async (request, { params, user }) => {
  const body = updateWorkspaceMemberBodySchema.parse(
    await parseJsonBody(request),
  );
  const data = await updateWorkspaceMemberRoleForUser(
    getDb(),
    user.userId,
    params.workspaceId,
    params.userId,
    body.role,
  );
  return jsonOk(data);
});

export const DELETE = withApiAuth(async (_request, { params, user }) => {
  const data = await removeWorkspaceMemberForUser(
    getDb(),
    user.userId,
    params.workspaceId,
    params.userId,
  );
  return jsonOk(data);
});
