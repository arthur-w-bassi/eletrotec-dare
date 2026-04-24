import "server-only";

import nodemailer from "nodemailer";

import { logService } from "@/lib/logger/log-service";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
}

export async function sendVerificationCodeEmail(to: string, code: string): Promise<void> {
  const from = process.env.SMTP_FROM ?? "noreply@localhost";
  const transport = createTransport();
  const subject = "Código de verificação";
  const text = `O teu código de verificação (válido por 15 minutos): ${code}`;

  if (!transport) {
    logService.warn("SMTP não configurado; email de verificação não enviado", {
      toDomain: to.split("@")[1] ?? "unknown",
    });
    return;
  }

  await transport.sendMail({ from, to, subject, text });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const from = process.env.SMTP_FROM ?? "noreply@localhost";
  const transport = createTransport();
  const subject = "Redefinir palavra-passe";
  const text = `Para redefinires a palavra-passe, visita (válido por 1 hora):\n${resetUrl}`;

  if (!transport) {
    logService.warn("SMTP não configurado; email de reset não enviado", {
      toDomain: to.split("@")[1] ?? "unknown",
    });
    return;
  }

  await transport.sendMail({ from, to, subject, text });
}
