import { parseJsonBody, withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";
import { updateSettingsBodySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import {
  getSettings,
  patchSettings,
  updateCurrentUserLanguage,
} from "@/lib/services/user-service";

export const GET = withApiAuth(async (_request, { user }) => {
  const data = await getSettings(getDb(), user.userId);
  return jsonOk(data);
});

export const PATCH = withApiAuth(async (request, { user }) => {
  const body = updateSettingsBodySchema.parse(await parseJsonBody(request));
  const { language, ...rest } = body;
  if (language) {
    await updateCurrentUserLanguage(getDb(), user.userId, language);
  }
  const data = await patchSettings(getDb(), user.userId, rest);
  return jsonOk(data);
});
