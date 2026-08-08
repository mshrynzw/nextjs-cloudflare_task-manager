import { withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { getDb } from "@/lib/db/server";
import { removeProjectMemberForUser } from "@/lib/services/project-service";

export const DELETE = withApiAuth(async (_request, { params, user }) => {
  const data = await removeProjectMemberForUser(
    getDb(),
    user.userId,
    params.projectId,
    params.userId,
  );
  return jsonOk(data);
});
