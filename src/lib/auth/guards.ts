import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "./constants";
import { getUserFromSessionToken, type AuthUser } from "./session";

export async function getServerAuthUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) {
    return null;
  }
  return getUserFromSessionToken(raw);
}

export function userHasRole(user: AuthUser, roleName: string): boolean {
  return user.roles.some((ur) => ur.role.name === roleName);
}
