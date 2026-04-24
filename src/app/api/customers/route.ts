import {
  createCustomerSchema,
  listCustomersSchema,
} from "@/domain/customer/customer-types";
import {
  createCustomer,
  listCustomers,
  mapCustomerToDTO,
} from "@/domain/customer/customer-service";
import { RATE_LIMITS } from "@/lib/http/rate-limit-config";
import { withApiRoute } from "@/lib/http/with-api-route";

export const POST = withApiRoute(
  {
    auth: true,
    csrf: true,
    schema: createCustomerSchema,
    rateLimit: RATE_LIMITS.customerCreate,
  },
  async (ctx) => {
    const row = await createCustomer(ctx.body);
    return ctx.success(mapCustomerToDTO(row), { status: 201 });
  },
);

export const GET = withApiRoute({ auth: true }, async (ctx) => {
  const sp = ctx.request.nextUrl.searchParams;
  const raw = {
    search: sp.get("search") ?? undefined,
    page: sp.get("page") || undefined,
    pageSize: sp.get("pageSize") || undefined,
    includeInactive: sp.get("includeInactive") ?? undefined,
  };

  const parsed = listCustomersSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Validação falhou";
    return ctx.error(400, "VALIDATION_ERROR", first);
  }

  const result = await listCustomers(parsed.data);
  return ctx.success({
    items: result.items.map(mapCustomerToDTO),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  });
});
