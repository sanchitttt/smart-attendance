import { cookies } from "next/headers";

type ApiFetchInit = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

/**
 * Server-side fetch helper that forwards the backend auth cookie.
 * Use this only in Server Components / Server Actions.
 */
export async function apiFetch(input: string, init: ApiFetchInit = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  // Forward cookie to backend for auth. (Node fetch won't include browser cookies automatically.)
  if (accessToken) {
    headers.set("Cookie", `access_token=${accessToken}`);
  }

  return fetch(input, {
    ...init,
    headers,
    // keep no-store by default for authenticated data
    cache: init.cache ?? "no-store",
  });
}

