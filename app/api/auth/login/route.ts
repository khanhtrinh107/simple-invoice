import { NextResponse } from "next/server";
import {
  decodeIdToken,
  exchangeToken,
  extractOrgToken,
  fetchUserProfile,
  profileFromIdToken,
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
  // then enrich with /users/me if available.
  let profile;
  try {
    if (tokenResponse.id_token) {
      const claims = decodeIdToken(tokenResponse.id_token);
      profile = profileFromIdToken(claims);
    }
  } catch (err) {
    console.warn("[login] failed to decode id_token:", err);
  }

  if (!profile) {
    try {
      profile = await fetchUserProfile(tokenResponse.access_token);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load user profile";
      return NextResponse.json({ error: message }, { status: 401 });
    }
  }

  // Org token may live in memberships[0].token from /users/me;
  // when we only have id_token claims we leave it empty.
  let orgToken: string | undefined;
  try {
    orgToken = extractOrgToken(profile);
  } catch {
    orgToken = undefined;
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
