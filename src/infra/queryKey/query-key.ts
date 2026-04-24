export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (params: {
      search?: string;
      page: number;
      pageSize: number;
      includeInactive: boolean;
    }) => ["customers", "list", params] as const,
    detail: (id: string) => ["customers", "detail", id] as const,
    cnpj: (cnpj: string) => ["customers", "cnpj", cnpj] as const,
  },
  catalog: {
    all: ["catalog"] as const,
    list: (params: {
      search?: string;
      type?: "PRODUCT" | "SERVICE";
      page: number;
      pageSize: number;
      includeInactive: boolean;
    }) => ["catalog", "list", params] as const,
    detail: (id: string) => ["catalog", "detail", id] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (params: {
      search?: string;
      status?: "DRAFT" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
      page: number;
      pageSize: number;
    }) => ["orders", "list", params] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
} as const;
