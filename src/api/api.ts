import ky from "ky";

function getPrefixUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const api = ky.create({
  prefixUrl: getPrefixUrl(),
  credentials: "include",
  retry: { limit: 0 },
  throwHttpErrors: false,
});
