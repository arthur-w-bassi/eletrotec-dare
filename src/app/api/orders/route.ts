import {
  createOrderSchema,
  listOrdersSchema,
} from "@/domain/order/order-types";
import {
  createOrder,
  listOrders,
  mapOrderToDTO,
  mapOrderToListDTO,
} from "@/domain/order/order-service";
import { RATE_LIMITS } from "@/lib/http/rate-limit-config";
import { withApiRoute } from "@/lib/http/with-api-route";

export const POST = withApiRoute(
  {
    auth: true,
    csrf: true,
    schema: createOrderSchema,
    rateLimit: RATE_LIMITS.orderCreate,
  },
  async (ctx) => {
    const row = await createOrder(ctx.body, ctx.user.id);
    return ctx.success(mapOrderToDTO(row), { status: 201 });
  },
);

export const GET = withApiRoute({ auth: true }, async (ctx) => {
  const sp = ctx.request.nextUrl.searchParams;
  const raw = {
    search: sp.get("search") ?? undefined,
    status: sp.get("status") ?? undefined,
    page: sp.get("page") || undefined,
    pageSize: sp.get("pageSize") || undefined,
  };

  const parsed = listOrdersSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Validação falhou";
    return ctx.error(400, "VALIDATION_ERROR", first);
  }

  const result = await listOrders(parsed.data);
  return ctx.success({
    items: result.items.map(mapOrderToListDTO),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  });
});
