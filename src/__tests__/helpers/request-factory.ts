import { NextRequest } from "next/server";

type NextRequestInit = ConstructorParameters<typeof NextRequest>[1];

export function createTestRequest(
  method: string,
  path: string,
  options?: {
    body?: unknown;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
  },
): NextRequest {
  const url = new URL(path, "http://localhost:3000");
  const headers = new Headers(options?.headers);

  if (options?.cookies) {
    headers.set(
      "cookie",
      Object.entries(options.cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join("; "),
    );
  }

  const init: NextRequestInit = { method, headers };

  if (options?.body !== undefined) {
    init.body = JSON.stringify(options.body);
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
  }

  return new NextRequest(url, init);
}

export async function parseJson<T = unknown>(res: Response): Promise<T> {
  return (await res.json()) as T;
}
