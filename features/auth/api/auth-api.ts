import type {
  Contact,
  IdTokenPayload,
  Membership,
  MembershipRaw,
  OidcTokenResponse,
  TokenResponse,
  UserProfile,
  UserProfileRaw,
  UserProfileResponse,
} from "@/features/auth/types/auth.types";
import { authConfig, membershipApiUrl } from "@/lib/env";

/**
 * Decode a JWT payload without verifying signature.
 * Verification happens upstream at WSO2 — we only use this for
 * non-sensitive claim reads (display name, etc.) and to short-circuit
 * a /users/me call when claims are sufficient.
 */
export function decodeIdToken(idToken: string): IdTokenPayload {
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed id_token: expected 3 segments");
  }

  const payload = parts[1];
  // Base64url → base64
  const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = Buffer.from(padded, "base64").toString("utf-8");
  return JSON.parse(json) as IdTokenPayload;
}

export async function exchangeToken(
  username: string,
  password: string
): Promise<OidcTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "password",
    username,
    password,
    client_id: authConfig.clientId,
    client_secret: authConfig.clientSecret,
    scope: "openid",
  });

  const response = await fetch(authConfig.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    let parsed: { error?: string; error_description?: string } | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Non-JSON body — fall through to the generic error path.
    }

    const oauthError = parsed?.error;
    // WSO2 returns verbose `error_description` strings. For any
    // authentication-credential failure we surface a single friendly
    // message to the UI; everything else is logged with detail.
    const isCredentialError =
      response.status === 400 ||
      response.status === 401 ||
      oauthError === "invalid_grant" ||
      oauthError === "invalid_client" ||
      oauthError === "invalid_request";

    if (isCredentialError) {
      console.warn(
        `[auth] token exchange rejected (${response.status} ${oauthError ?? "n/a"}):`,
        parsed?.error_description ?? text
      );
      throw new Error("Incorrect username or password");
    }

    const detail = parsed?.error_description || oauthError || text;
    throw new Error(`Token exchange failed: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as OidcTokenResponse;
  if (!data.access_token) {
    throw new Error("Token exchange response missing access_token");
  }

  return data;
}

/**
 * Refresh an access_token using a refresh_token grant.
 * The WSO2 token endpoint accepts `grant_type=refresh_token` with the
 * stored refresh_token in the body. Returns the raw OIDC response so callers
 * can persist the new tokens.
 */
export async function refreshToken(
  refreshTokenValue: string
): Promise<OidcTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshTokenValue,
    client_id: authConfig.clientId,
    client_secret: authConfig.clientSecret,
    scope: "openid",
  });

  const response = await fetch(authConfig.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    let parsed: { error?: string } | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // non-JSON body
    }
    const error = parsed?.error ?? text;
    throw new Error(`Token refresh failed: ${response.status} ${error}`);
  }

  return response.json() as Promise<OidcTokenResponse>;
}

/**
 * Map the OIDC token response to the camelCase shape used inside the app.
 * Keeps all token fields (access/refresh/id) so they can be persisted.
 */
export function toTokenResponse(data: OidcTokenResponse): TokenResponse & {
  refreshToken?: string;
  idToken?: string;
  scope?: string;
} {
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type || "Bearer",
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    scope: data.scope,
  };
}

function findPrimaryContact(contacts: Contact[] | undefined, type: string): string | undefined {
  if (!contacts?.length) return undefined;
  const match = contacts.find((c) => c.type === type);
  return match?.value;
}

function mapMembership(raw: MembershipRaw): Membership {
  return {
    id: raw.membershipId,
    organisationId: raw.organisationId,
    name: raw.organisationName,
    role: raw.roleName,
    organisationRole: raw.organisationRole,
    token: raw.token,
  };
}

export function mapUserProfile(raw: UserProfileRaw): UserProfile {
  // Email may come from top-level `email` or from contacts[] of type=email.
  const email =
    raw.email ||
    findPrimaryContact(raw.contacts, "email") ||
    "";

  // Phone may come from `mobileNumber` or from contacts[] of type=mobile.
  const phoneNumber =
    raw.mobileNumber ||
    findPrimaryContact(raw.contacts, "mobile") ||
    undefined;

  const memberships = (raw.memberships ?? []).map(mapMembership);

  // Prefer `listRoles` (string list); fall back to roles[].roleName.
  const roles =
    raw.listRoles && raw.listRoles.length > 0
      ? raw.listRoles
      : (raw.roles ?? []).map((r) => r.roleName);

  return {
    id: raw.userId,
    username: raw.userName,
    email,
    firstName: raw.firstName ?? "",
    lastName: raw.lastName ?? "",
    phoneNumber,
    isUSCitizen: raw.isUSCitizen,
    status: raw.status,
    memberships,
    roles,
  };
}

/**
 * Hit the membership service and unwrap the `{ data: {...} }` envelope.
 */
export async function fetchUserProfile(accessToken: string): Promise<UserProfile> {
  const response = await fetch(`${membershipApiUrl}/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch user profile: ${response.status} ${text}`);
  }

  const envelope = (await response.json()) as UserProfileResponse;
  if (!envelope?.data) {
    throw new Error("users/me response missing `data` field");
  }

  return mapUserProfile(envelope.data);
}

export function extractOrgToken(profile: UserProfile): string {
  if (!profile.memberships || profile.memberships.length === 0) {
    throw new Error("No memberships found in user profile");
  }
  const first = profile.memberships[0];
  if (!first.token) {
    throw new Error("First membership has no token");
  }
  return first.token;
}

/**
 * Build a UserProfile from the id_token claims.
 * Used as a fallback when /users/me is unavailable.
 */
export function profileFromIdToken(payload: IdTokenPayload): UserProfile {
  const id = payload.userid || payload.sub;
  if (!id) {
    throw new Error("id_token missing sub/userid claim");
  }

  return {
    id,
    username: payload.preferred_username || payload.email || id,
    email: payload.email || "",
    firstName: payload.given_name || "",
    lastName: payload.family_name || "",
    memberships: payload.org_id
      ? [
          {
            id: payload.org_id,
            organisationId: payload.org_id,
            name: payload.org_name || payload.org_id,
            role: "selfsignup",
            token: "",
          },
        ]
      : [],
    roles: [],
  };
}
