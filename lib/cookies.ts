import { cookies } from "next/headers";
import { AUTH_COOKIE_NAMES, AUTH_COOKIE_OPTIONS } from "@/shared/constants";

export interface AuthCookies {
  accessToken: string;
  orgToken: string;
}

export async function setAuthCookies(accessToken: string, orgToken: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 8, // 8 hours
  });

  cookieStore.set(AUTH_COOKIE_NAMES.ORG_TOKEN, orgToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 8,
  });
}

export async function getAuthTokens(): Promise<AuthCookies | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const orgToken = cookieStore.get(AUTH_COOKIE_NAMES.ORG_TOKEN)?.value;

  if (!accessToken || !orgToken) {
    return null;
  }

  return { accessToken, orgToken };
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAMES.ACCESS_TOKEN, "", {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });

  cookieStore.set(AUTH_COOKIE_NAMES.ORG_TOKEN, "", {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });
}
