import {
  createCatalogItemSchema,
  listCatalogItemsSchema,
} from "@/domain/catalog/catalog-types";
import {
  createCatalogItem,
  listCatalogItems,
  mapCatalogItemToDTO,
} from "@/domain/catalog/catalog-service";
import { RATE_LIMITS } from "@/lib/http/rate-limit-config";
import { withApiRoute } from "@/lib/http/with-api-route";

export const POST = withApiRoute(
  {
    auth: true,
    csrf: true,
    schema: createCatalogItemSchema,
    rateLimit: RATE_LIMITS.catalogCreate,
  },
  async (ctx) => {
    const row = await createCatalogItem(ctx.body);
    return ctx.success(mapCatalogItemToDTO(row), { status: 201 });
  },
);

export const GET = withApiRoute({ auth: true }, async (ctx) => {
  const sp = ctx.request.nextUrl.searchParams;
  const raw = {
    search: sp.get("search") ?? undefined,
    type: sp.get("type") ?? undefined,
    page: sp.get("page") || undefined,
    pageSize: sp.get("pageSize") || undefined,
    includeInactive: sp.get("includeInactive") ?? undefined,
  };

  const parsed = listCatalogItemsSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Validação falhou";
    return ctx.error(400, "VALIDATION_ERROR", first);
  }

  const result = await listCatalogItems(parsed.data);
  return ctx.success({
    items: result.items.map(mapCatalogItemToDTO),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  });
});
