import { mapUserToDTO, getUserById } from "@/domain/auth/auth-service";
import { withApiRoute } from "@/lib/http/with-api-route";

export const GET = withApiRoute({ auth: true }, async (ctx) => {
  const fresh = await getUserById(ctx.user.id);
  if (!fresh) {
    return ctx.error(401, "UNAUTHORIZED", "Sessão inválida ou expirada.");
  }
  return ctx.success(mapUserToDTO(fresh));
});
