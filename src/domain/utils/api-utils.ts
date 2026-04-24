import { HTTPError } from "ky";

import { logService } from "@/lib/logger/log-service";

export interface ErrorDTO {
  code: string;
  message: string;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: ErrorDTO };

export async function handleApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    logService.error("Resposta JSON inválida da API", { status: response.status });
    throw new ApiClientError(response.status, "INVALID_JSON", "Resposta inválida do servidor");
  }

  const body = parsed as ApiEnvelope<T>;
  if (body && typeof body === "object" && "success" in body) {
    if (body.success) {
      return body.data;
    }
    const err = body.error;
    throw new ApiClientError(response.status, err.code, err.message);
  }

  throw new ApiClientError(response.status, "UNKNOWN", "Erro desconhecido");
}

export async function handleKyError(error: unknown): Promise<never> {
  if (error instanceof HTTPError) {
    try {
      return await handleApiResponse(error.response);
    } catch (e) {
      if (e instanceof ApiClientError) {
        throw e;
      }
    }
    throw new ApiClientError(error.response.status, "HTTP_ERROR", "Pedido falhou");
  }
  throw error;
}
