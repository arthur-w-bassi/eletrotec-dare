export function isMutationOriginAllowed(request: Request): boolean {
  const allowed = process.env.NEXT_PUBLIC_APP_URL;
  if (!allowed) {
    return process.env.NODE_ENV !== "production";
  }
  try {
    const allowedOrigin = new URL(allowed).origin;
    const origin = request.headers.get("origin");
    if (origin) {
      return new URL(origin).origin === allowedOrigin;
    }
    const referer = request.headers.get("referer");
    if (referer) {
      return new URL(referer).origin === allowedOrigin;
    }
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}
