/**
 * Global fetch interceptor: any `/api/*` response that comes back with 401
 * is treated as a session-expired signal and triggers a redirect to `/login`.
 *
 * Excluded paths (so they're allowed to return 401 without triggering the
 * global redirect):
 *   - `/api/auth/login` — wrong credentials must surface as an error, not a
 *     silent redirect away from the login form.
 *   - `/api/auth/me`    — used by the auth probe; returning `null` is the
 *     documented signal for "not signed in" and must not navigate away.
 *
 * On the server (SSR/RSC) we can't meaningfully redirect from a `fetch`
 * interceptor, so the wrapper only runs in the browser. Server-side 401s
 * are handled by the route handlers themselves (see app/api/auth/*).
 *
 * Installed once via `installFetchInterceptor()` (idempotent). Call it from
 * the root client layout so every page gets the behaviour without having to
 * thread a wrapper through every fetch call.
 */

const REDIRECT_PATH = "/login";
const EXCLUDED_PATHS: readonly string[] = ["/api/auth/login", "/api/auth/me"];

declare global {
  var __fetchInterceptorInstalled: boolean | undefined;
}

type FetchInput = Parameters<typeof window.fetch>[0];

function shouldHandle(input: FetchInput): boolean {
  if (typeof window === "undefined") return false;

  let url: string;
  if (typeof input === "string") {
    url = input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else if (typeof input === "object" && "url" in input) {
    url = (input as Request).url;
  } else {
    return false;
  }

  // Only intercept same-origin /api/* calls. Cross-origin 401s are not ours
  // to handle (e.g. third-party APIs behind the same dev proxy).
  if (!url.startsWith("/") && !url.startsWith(window.location.origin)) {
    return false;
  }

  const path = url.startsWith("/") ? url : new URL(url).pathname;
  if (!path.startsWith("/api/")) return false;
  if (EXCLUDED_PATHS.some((excluded) => path.startsWith(excluded))) return false;

  return true;
}

/**
 * Redirect-once guard: if we're already mid-redirect, don't kick off another
 * `window.location` change (which would race against itself and visibly flash).
 */
function redirectToLogin(): void {
  if (
    typeof window === "undefined" ||
    window.location.pathname === REDIRECT_PATH
  ) {
    return;
  }
  window.location.href = REDIRECT_PATH;
}

export function installFetchInterceptor(): void {
  if (typeof window === "undefined") return;
  if (globalThis.__fetchInterceptorInstalled) return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function patchedFetch(
    input: FetchInput,
    init?: RequestInit
  ): Promise<Response> {
    const response = await originalFetch(input, init);

    if (response.status === 401 && shouldHandle(input)) {
      // Best-effort: try to drain the body so the connection can be reused,
      // then navigate. Swallow errors — we're redirecting anyway.
      try {
        await response.clone().text();
      } catch {
        // ignore
      }
      redirectToLogin();
    }

    return response;
  };

  globalThis.__fetchInterceptorInstalled = true;
}