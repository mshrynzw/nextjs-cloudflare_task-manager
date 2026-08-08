import { withApiAuth } from "@/lib/api/handler";
import { jsonOk } from "@/lib/api/http";

export const GET = withApiAuth(async (_request, { user }) => {
  return jsonOk({
    user: {
      id: user.userId,
      name: user.name,
      email: user.email,
      image: null,
    },
  });
});
