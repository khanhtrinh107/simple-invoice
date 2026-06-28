/**
 * Thin fetch wrapper for relative `/api/*` calls.
 *
 * The cookie is sent automatically with `credentials: "include"`. Session
 * expiry (401) is handled globally by `lib/fetch-interceptor`, so this
 * wrapper does not need to inspect the status code itself — it just forwards
 * the response to the caller.
 */
type AuthedFetchOptions = Omit<RequestInit, "credentials">;

export async function authedFetch(
  input: RequestInfo,
  options: AuthedFetchOptions = {}
): Promise<Response> {
  return fetch(input, {
    ...options,
    credentials: "include",
  });
}