import "server-only";

import { Prisma } from "@/generated/prisma/client";

import {
  EMAIL_CODE_TTL_MS,
  PASSWORD_RESET_TTL_MS,
  ROLE_USER,
} from "@/lib/auth/constants";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma/client";
import {
  bufferToHex,
  generateSessionTokenBytes,
  generateSixDigitCode,
  hexTimingSafeEqual,
  sha256HexFromBuffer,
  sha256HexFromUtf8,
} from "@/lib/security/crypto";
import { sendPasswordResetEmail, sendVerificationCodeEmail } from "@/lib/email/email-service";
import { logService } from "@/lib/logger/log-service";

import type { AuthUser } from "@/lib/auth/session";
import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UserDTO,
  VerifyEmailPayload,
} from "./auth-types";

const userInclude = {
  roles: { include: { role: true } },
} as const;

export function mapUserToDTO(user: AuthUser): UserDTO {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
    roles: user.roles.map((ur) => ur.role.name),
  };
}

async function findUserByIdentifier(identifier: string): Promise<AuthUser | null> {
  const trimmed = identifier.trim();
  return prisma.user.findFirst({
    where: {
      OR: [{ username: trimmed }, { email: { equals: trimmed, mode: "insensitive" } }],
    },
    include: userInclude,
  });
}

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const role = await prisma.role.findUnique({ where: { name: ROLE_USER } });
  if (!role) {
    logService.error("Papel user em falta na base de dados");
    throw new Error("CONFIG_ERROR");
  }

  const passwordHash = await hashPassword(payload.password);
  const code = generateSixDigitCode();
  const codeHash = sha256HexFromUtf8(code);
  const expiresAt = new Date(Date.now() + EMAIL_CODE_TTL_MS);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          username: payload.username.trim(),
          email: payload.email.trim().toLowerCase(),
          passwordHash,
          roles: { create: { roleId: role.id } },
        },
      });
      await tx.emailVerificationCode.create({
        data: {
          userId: u.id,
          codeHash,
          expiresAt,
          maxAttempts: 5,
        },
      });
      return u;
    });

    await sendVerificationCodeEmail(user.email, code);

    const full = await prisma.user.findUnique({
      where: { id: user.id },
      include: userInclude,
    });
    if (!full) {
      throw new Error("NOT_FOUND");
    }
    return full;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("DUPLICATE");
    }
    throw e;
  }
}

export async function loginUser(payload: LoginPayload): Promise<AuthUser | null> {
  const user = await findUserByIdentifier(payload.identifier);
  if (!user || !user.isActive) {
    return null;
  }
  const ok = await verifyPassword(payload.password, user.passwordHash);
  if (!ok) {
    return null;
  }
  return user;
}

export async function requestPasswordReset(payload: ForgotPasswordPayload): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { email: { equals: payload.email.trim(), mode: "insensitive" } },
  });
  if (!user || !user.isActive) {
    return;
  }

  const raw = generateSessionTokenBytes();
  const tokenHex = bufferToHex(raw);
  const tokenHash = sha256HexFromBuffer(raw);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${base.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(tokenHex)}&userId=${encodeURIComponent(user.id)}`;

  await sendPasswordResetEmail(user.email, resetUrl);
}

export async function resetPasswordWithToken(payload: ResetPasswordPayload): Promise<boolean> {
  let buf: Buffer;
  try {
    buf = Buffer.from(payload.token, "hex");
  } catch {
    return false;
  }
  if (buf.length !== 32) {
    return false;
  }
  const tokenHash = sha256HexFromBuffer(buf);

  const row = await prisma.passwordResetToken.findFirst({
    where: {
      userId: payload.userId,
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!row) {
    return false;
  }

  const passwordHash = await hashPassword(payload.newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: payload.userId },
      data: { passwordHash },
    });
    await tx.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    });
    await tx.session.deleteMany({ where: { userId: payload.userId } });
  });

  return true;
}

export async function sendEmailVerification(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    throw new Error("NOT_FOUND");
  }
  if (user.emailVerifiedAt) {
    return;
  }

  const code = generateSixDigitCode();
  const codeHash = sha256HexFromUtf8(code);
  const expiresAt = new Date(Date.now() + EMAIL_CODE_TTL_MS);

  await prisma.emailVerificationCode.deleteMany({
    where: { userId, usedAt: null },
  });

  await prisma.emailVerificationCode.create({
    data: { userId, codeHash, expiresAt, maxAttempts: 5 },
  });

  await sendVerificationCodeEmail(user.email, code);
}

export async function verifyEmailWithCode(
  userId: string,
  payload: VerifyEmailPayload,
): Promise<"ok" | "invalid" | "locked"> {
  const row = await prisma.emailVerificationCode.findFirst({
    where: {
      userId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!row) {
    return "invalid";
  }

  const attemptHash = sha256HexFromUtf8(payload.code);
  const matches = hexTimingSafeEqual(attemptHash, row.codeHash);

  if (!matches) {
    const nextAttempts = row.attempts + 1;
    if (nextAttempts >= row.maxAttempts) {
      await prisma.emailVerificationCode.update({
        where: { id: row.id },
        data: { attempts: nextAttempts, usedAt: new Date() },
      });
      return "locked";
    }
    await prisma.emailVerificationCode.update({
      where: { id: row.id },
      data: { attempts: nextAttempts },
    });
    return "invalid";
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    });
    await tx.emailVerificationCode.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    });
  });

  return "ok";
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  return prisma.user.findUnique({
    where: { id },
    include: userInclude,
  });
}
