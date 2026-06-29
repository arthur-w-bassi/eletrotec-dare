import { listProposalTemplatesSchema } from "@/domain/proposal/proposal-schemas";
import {
  listProposalTemplates,
  mapProposalTemplateToDTO,
} from "@/domain/proposal/proposal-template-service";
import { withApiRoute } from "@/lib/http/with-api-route";

export const GET = withApiRoute({ auth: true }, async (ctx) => {
  const sp = ctx.request.nextUrl.searchParams;
  const raw = {
    search: sp.get("search") ?? undefined,
    category: sp.get("category") ?? undefined,
    page: sp.get("page") || undefined,
    pageSize: sp.get("pageSize") || undefined,
  };

  const parsed = listProposalTemplatesSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Validação falhou";
    return ctx.error(400, "VALIDATION_ERROR", first);
  }

  const result = await listProposalTemplates(parsed.data);
  return ctx.success({
    items: result.items.map(mapProposalTemplateToDTO),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  });
});
