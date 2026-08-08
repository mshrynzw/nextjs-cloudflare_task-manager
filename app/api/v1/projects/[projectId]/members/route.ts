import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonCreated, jsonOk } from "@/lib/api/http";
import { addMemberBodySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import {
  addProjectMemberForUser,
  getProjectMembersForUser,
} from "@/lib/services/project-service";

export const GET = withApiAuth(async (_request, { params, user }) => {
  const data = await getProjectMembersForUser(
    getDb(),
    user.userId,
    params.projectId,
  );
  return jsonOk(data);
});

export const POST = withApiAuth(async (request, { params, user }) => {
  const body = addMemberBodySchema.parse(await parseJsonBody(request));
  const data = await addProjectMemberForUser(
    getDb(),
    user.userId,
    params.projectId,
    body,
  );
  return jsonCreated(data);
});
