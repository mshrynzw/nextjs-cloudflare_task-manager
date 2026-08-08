import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { updateUserBodySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import {
  getUserPublicProfile,
  updateCurrentUserProfile,
} from "@/lib/services/user-service";

export const GET = withApiAuth(async (_request, { params, user }) => {
  const data = await getUserPublicProfile(getDb(), user.userId, params.userId);
  return jsonOk(data);
});

export const PATCH = withApiAuth(async (request, { params, user }) => {
  const body = updateUserBodySchema.parse(await parseJsonBody(request));
  const data = await updateCurrentUserProfile(
    getDb(),
    user.userId,
    params.userId,
    body,
  );
  return jsonOk(data);
});
