import type { UserProfile, LoginResponse, TokenResponse } from "@/features/auth/types/auth.types";
import { authConfig, membershipApiUrl } from "@/lib/env";

export async function exchangeToken(
  username: string,
  password: string
): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: "password",
    username,
    password,
    client_id: authConfig.clientId,
    client_secret: authConfig.clientSecret,
  });

  const response = await fetch(authConfig.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

export async function fetchUserProfile(accessToken: string): Promise<UserProfile> {
  const response = await fetch(`${membershipApiUrl}/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch user profile: ${response.status} ${text}`);
  }

  return response.json();
}

export function extractOrgToken(profile: UserProfile): string {
  if (!profile.memberships || profile.memberships.length === 0) {
    throw new Error("No memberships found in user profile");
  }
  return profile.memberships[0].token;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const tokenResponse = await exchangeToken(username, password);
  const profile = await fetchUserProfile(tokenResponse.accessToken);
  const orgToken = extractOrgToken(profile);

  return {
    user: {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
    },
    accessToken: orgToken,
  };
}
