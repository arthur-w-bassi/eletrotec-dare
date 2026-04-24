export const SESSION_COOKIE_NAME = "et_session";

/** 30 dias */
export const SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60;

export const SESSION_DURATION_MS = SESSION_MAX_AGE_SEC * 1000;

/** 1 hora */
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

/** 15 minutos */
export const EMAIL_CODE_TTL_MS = 15 * 60 * 1000;

export const ROLE_USER = "user";
export const ROLE_ADMIN = "admin";
