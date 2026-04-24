import { api } from "@/api/api";
import { apiPaths } from "@/api/api-paths";
import { handleApiResponse } from "@/domain/utils/api-utils";

import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UserDTO,
  VerifyEmailPayload,
} from "./auth-types";

export async function postRegister(payload: RegisterPayload): Promise<UserDTO> {
  const res = await api.post(apiPaths.auth.register, { json: payload });
  return handleApiResponse<UserDTO>(res);
}

export async function postLogin(payload: LoginPayload): Promise<UserDTO> {
  const res = await api.post(apiPaths.auth.login, { json: payload });
  return handleApiResponse<UserDTO>(res);
}

export async function postLogout(): Promise<void> {
  const res = await api.post(apiPaths.auth.logout);
  await handleApiResponse<{ ok: boolean }>(res);
}

export async function getMe(): Promise<UserDTO> {
  const res = await api.get(apiPaths.auth.me);
  return handleApiResponse<UserDTO>(res);
}

export async function postForgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
  const res = await api.post(apiPaths.auth.forgotPassword, { json: payload });
  return handleApiResponse<{ message: string }>(res);
}

export async function postResetPassword(payload: ResetPasswordPayload): Promise<void> {
  const res = await api.post(apiPaths.auth.resetPassword, { json: payload });
  await handleApiResponse<{ ok: boolean }>(res);
}

export async function postSendVerification(): Promise<void> {
  const res = await api.post(apiPaths.auth.sendVerification);
  await handleApiResponse<{ ok: boolean }>(res);
}

export async function postVerifyEmail(payload: VerifyEmailPayload): Promise<{ user: UserDTO }> {
  const res = await api.post(apiPaths.auth.verifyEmail, { json: payload });
  return handleApiResponse<{ user: UserDTO }>(res);
}
