import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Mínimo de 8 caracteres")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
    "Incluir maiúscula, minúscula, número e símbolo",
  );

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(32, "Máximo 32 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Apenas letras, números e _"),
  email: z.string().email("Email inválido"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Obrigatório"),
  password: z.string().min(1, "Obrigatório"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token inválido"),
  userId: z.uuid("Identificador inválido"),
  newPassword: passwordSchema,
});

export const verifyEmailSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Código deve ter 6 dígitos"),
});

export type RegisterPayload = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailPayload = z.infer<typeof verifyEmailSchema>;

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  emailVerifiedAt: string | null;
  roles: string[];
}
