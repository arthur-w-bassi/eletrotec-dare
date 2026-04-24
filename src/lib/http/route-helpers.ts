import { NextResponse } from "next/server";

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export type ApiErrorBody = {
  success: false;
  error: { code: string; message: string };
};

export type ApiSuccessBody<T> = { success: true; data: T };

export function jsonError(status: number, code: string, message: string): NextResponse<ApiErrorBody> {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export function jsonSuccess<T>(data: T, init?: { status?: number }): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json({ success: true, data }, { status: init?.status ?? 200 });
}
