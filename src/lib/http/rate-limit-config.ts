export const RATE_LIMIT_WINDOW_MS = 60_000;

export interface RateLimitPreset {
  prefix: string;
  max: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  login: { prefix: "login", max: 10, windowMs: RATE_LIMIT_WINDOW_MS },
  register: { prefix: "register", max: 5, windowMs: RATE_LIMIT_WINDOW_MS },
  forgotPassword: { prefix: "forgot", max: 3, windowMs: RATE_LIMIT_WINDOW_MS },
  resetPassword: { prefix: "reset", max: 5, windowMs: RATE_LIMIT_WINDOW_MS },
  sendVerification: { prefix: "send-verify", max: 3, windowMs: RATE_LIMIT_WINDOW_MS },
  verifyEmail: { prefix: "verify-email", max: 5, windowMs: RATE_LIMIT_WINDOW_MS },
  customerCreate: { prefix: "customer-create", max: 20, windowMs: RATE_LIMIT_WINDOW_MS },
  catalogCreate: { prefix: "catalog-create", max: 20, windowMs: RATE_LIMIT_WINDOW_MS },
  orderCreate: { prefix: "order-create", max: 20, windowMs: RATE_LIMIT_WINDOW_MS },
  cnpjLookup: { prefix: "cnpj-lookup", max: 10, windowMs: RATE_LIMIT_WINDOW_MS },
} as const satisfies Record<string, RateLimitPreset>;
