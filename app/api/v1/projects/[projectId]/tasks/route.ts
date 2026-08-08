import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonCreated, jsonOk } from "@/lib/api/http";
import { parseSearchParams } from "@/lib/api/schemas";
import {
  createTaskBodySchema,
  listTasksQuerySchema,
} from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import {
  createTaskForProject,
  getTasksForProject,
} from "@/lib/services/task-service";

export const GET = withApiAuth(async (request, { params, user }) => {
  const query = parseSearchParams(
    listTasksQuerySchema,
    request.nextUrl.searchParams,
  );
  const data = await getTasksForProject(
    getDb(),
    user.userId,
    params.projectId,
    query,
  );
  return jsonOk(data);
});

export const POST = withApiAuth(async (request, { params, user }) => {
  const body = createTaskBodySchema.parse(await parseJsonBody(request));
  const data = await createTaskForProject(
    getDb(),
    user.userId,
    params.projectId,
    body,
  );
  return jsonCreated(data);
});
