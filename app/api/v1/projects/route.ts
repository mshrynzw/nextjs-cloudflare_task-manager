import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonCreated, jsonList } from "@/lib/api/http";
import { parseSearchParams } from "@/lib/api/schemas";
import {
  createProjectBodySchema,
  listProjectsQuerySchema,
} from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import {
  createProjectForUser,
  getProjects,
  resolveDefaultWorkspaceId,
} from "@/lib/services/project-service";
import { validationError } from "@/lib/api/errors";

export const GET = withApiAuth(async (request, { user }) => {
  const query = parseSearchParams(
    listProjectsQuerySchema,
    request.nextUrl.searchParams,
  );
  const result = await getProjects(getDb(), user.userId, query);
  return jsonList(result.data, result.meta);
});

export const POST = withApiAuth(async (request, { user }) => {
  const body = createProjectBodySchema.parse(await parseJsonBody(request));
  const workspaceId =
    body.workspaceId ?? (await resolveDefaultWorkspaceId(getDb(), user.userId));

  if (!workspaceId) {
    throw validationError("workspaceId is required", [
      {
        field: "workspaceId",
        message: "No workspace available for this user.",
      },
    ]);
  }

  const created = await createProjectForUser(getDb(), user.userId, {
    ...body,
    workspaceId,
  });
  return jsonCreated(created);
});
