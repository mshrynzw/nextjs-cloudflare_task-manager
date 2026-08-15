import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonCreated, jsonOk } from "@/lib/api/http";
import { addWorkspaceMemberBodySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import {
  addWorkspaceMemberForUser,
  getWorkspaceMembersForUser,
} from "@/lib/services/workspace-service";

export const GET = withApiAuth(async (_request, { params, user }) => {
  const data = await getWorkspaceMembersForUser(
    getDb(),
    user.userId,
    params.workspaceId,
  );
  return jsonOk(data);
});

export const POST = withApiAuth(async (request, { params, user }) => {
  const body = addWorkspaceMemberBodySchema.parse(await parseJsonBody(request));
  const data = await addWorkspaceMemberForUser(
    getDb(),
    user.userId,
    params.workspaceId,
    body,
  );
  return jsonCreated(data);
});
