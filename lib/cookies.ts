import { cookies } from "next/headers";
import { AUTH_COOKIE_OPTIONS, AUTH_TOKEN_COOKIES } from "@/shared/constants";

export interface AuthCookies {
  accessToken: string;
  orgToken: string;
}

export interface PersistableTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  /** Seconds until access_token expires — drives cookie maxAge. */
  expiresIn?: number;
  /** Pre-resolved org/membership token. Optional; if absent, only access cookie is set. */
  orgToken?: string;
}

/**
 * Cookie maxAge values:
 * - access_token / id_token: driven by `expires_in` (default 1h).
 * - refresh_token: longer-lived (default 30d) so we can silently refresh.
 */
const DEFAULT_ACCESS_MAX_AGE = 60 * 60; // 1 hour
const DEFAULT_REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function setAuthCookies(
  accessToken: string,
  orgToken: string,
  options?: { expiresIn?: number }
): Promise<void> {
  const cookieStore = await cookies();
  const accessMaxAge = options?.expiresIn ?? DEFAULT_ACCESS_MAX_AGE;

  cookieStore.set(AUTH_TOKEN_COOKIES.ACCESS_TOKEN, accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: accessMaxAge,
  });

  if (orgToken) {
    cookieStore.set(AUTH_TOKEN_COOKIES.ORG_TOKEN, orgToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: accessMaxAge,
    });
  }
}

/**
 * Persist the full OIDC token set (access + refresh + id).
 * Use this right after a successful login so subsequent requests
 * can refresh silently without redirecting the user back to login.
 */
export async function setOidcTokenCookies(tokens: PersistableTokens): Promise<void> {
  const cookieStore = await cookies();
  const accessMaxAge = tokens.expiresIn ?? DEFAULT_ACCESS_MAX_AGE;
  const refreshMaxAge = Math.max(accessMaxAge, DEFAULT_REFRESH_MAX_AGE);

  cookieStore.set(AUTH_TOKEN_COOKIES.ACCESS_TOKEN, tokens.accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: accessMaxAge,
  });

  if (tokens.refreshToken) {
    cookieStore.set(AUTH_TOKEN_COOKIES.REFRESH_TOKEN, tokens.refreshToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: refreshMaxAge,
    });
  }

  if (tokens.idToken) {
    cookieStore.set(AUTH_TOKEN_COOKIES.ID_TOKEN, tokens.idToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: accessMaxAge,
    });
  }

  if (tokens.orgToken) {
    cookieStore.set(AUTH_TOKEN_COOKIES.ORG_TOKEN, tokens.orgToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: accessMaxAge,
    });
  }
}

export async function getAuthTokens(): Promise<AuthCookies | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_TOKEN_COOKIES.ACCESS_TOKEN)?.value;
  const orgToken = cookieStore.get(AUTH_TOKEN_COOKIES.ORG_TOKEN)?.value;

  if (!accessToken) {
    return null;
  }

  return {
    accessToken,
    orgToken: orgToken ?? "",
  };
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIES.REFRESH_TOKEN)?.value ?? null;
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  for (const name of Object.values(AUTH_TOKEN_COOKIES)) {
    cookieStore.set(name, "", {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 0,
    });
  }
}
