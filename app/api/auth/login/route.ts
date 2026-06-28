import { NextResponse } from "next/server";
import {
  exchangeToken,
  extractOrgToken,
  fetchUserProfile,
} from "@/features/auth/api/auth-api";
import { setOidcTokenCookies } from "@/lib/cookies";
import { loginSchema } from "@/shared/validators";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid credentials", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;

  let tokenResponse;
  try {
    tokenResponse = await exchangeToken(username, password);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Authentication failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }

  // Derive user from id_token first (cheaper + signed by IdP),
  // then enrich with /users/me to get the real org token from memberships.
  let profile;
  try {
    profile = await fetchUserProfile(tokenResponse.access_token);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load user profile";
    return NextResponse.json({ error: message }, { status: 401 });
  }

  // Extract the org/membership token. This is required for all downstream
  // invoice API calls — the id_token only carries org metadata, not the token.
  let orgToken: string | undefined;
  try {
    orgToken = extractOrgToken(profile);
  } catch {
    orgToken = undefined;
  }

  if (!orgToken) {
    return NextResponse.json(
      { error: "No organisation membership found for this account" },
      { status: 401 }
    );
  }

  try {
    await setOidcTokenCookies({
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      idToken: tokenResponse.id_token,
      orgToken,
      expiresIn: tokenResponse.expires_in,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to set session cookies" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      user: {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
      },
    },
    { status: 200 }
  );
}
