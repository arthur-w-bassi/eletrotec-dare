import "server-only";

import type { User } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma/client";

import { SESSION_DURATION_MS } from "./constants";
import {
  bufferToHex,
  generateSessionTokenBytes,
  sha256HexFromBuffer,
} from "@/lib/security/crypto";

const userWithRolesInclude = {
  roles: { include: { role: true } },
} as const;

export type AuthUser = User & {
  roles: { role: { name: string } }[];
};

export async function createSession(
  userId: string,
  ipAddress: string | null,
  userAgent: string | null,
): Promise<{ rawToken: string; expiresAt: Date }> {
  const raw = generateSessionTokenBytes();
  const rawToken = bufferToHex(raw);
  const tokenHash = sha256HexFromBuffer(raw);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      ipAddress: ipAddress ?? undefined,
      userAgent: userAgent ?? undefined,
    },
  });

  return { rawToken, expiresAt };
}

export async function getUserFromSessionToken(rawToken: string): Promise<AuthUser | null> {
  let buf: Buffer;
  try {
    buf = Buffer.from(rawToken, "hex");
  } catch {
    return null;
  }
  if (buf.length !== 32) {
    return null;
  }
  const tokenHash = sha256HexFromBuffer(buf);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: { include: userWithRolesInclude } },
  });
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  if (!session.user.isActive) {
    return null;
  }
  return session.user;
}

export async function deleteSessionByRawToken(rawToken: string): Promise<void> {
  let buf: Buffer;
  try {
    buf = Buffer.from(rawToken, "hex");
  } catch {
    return;
  }
  if (buf.length !== 32) {
    return;
  }
  const tokenHash = sha256HexFromBuffer(buf);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export async function deleteAllSessionsForUser(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}
